package com.rngooglemapsplus

import android.util.LruCache
import com.rngooglemapsplus.extensions.readAtMost
import com.rngooglemapsplus.extensions.toPng
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.cancellation.CancellationException

private const val IMAGE_CACHE_BYTES = 32 * 1024 * 1024
private const val MAX_IMAGE_BYTES = 8 * 1024 * 1024
private const val MAX_REDIRECTS = 5
private const val TIMEOUT_MS = 5000

class SvgImageLoader(
  private val mapErrorHandler: MapErrorHandler,
  private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO),
) {
  private val cache =
    object : LruCache<String, ByteArray>(IMAGE_CACHE_BYTES) {
      override fun sizeOf(
        key: String,
        value: ByteArray,
      ): Int = value.size
    }

  private val downloads = ConcurrentHashMap<String, Deferred<ByteArray>>()

  suspend fun resolveImages(
    document: SvgDocument,
    markerId: String,
  ): Boolean {
    val images = fetchAll(document.remoteImageHrefs, markerId)
    currentCoroutineContext().ensureActive()
    return applyImages(document, markerId, images)
  }

  fun resolveCachedImages(
    document: SvgDocument,
    markerId: String,
  ) {
    val images = document.remoteImageHrefs.mapNotNull { href -> cache.get(href)?.let { href to it } }
    applyImages(document, markerId, images.toMap())
  }

  suspend fun prefetch(
    svg: String,
    markerId: String,
  ): Boolean {
    val hrefs = SvgDocument(svg, 1, 1).use { it.remoteImageHrefs }
    return fetchAll(hrefs.filter { cache.get(it) == null }, markerId).isNotEmpty()
  }

  fun clear() {
    cache.evictAll()
  }

  private fun applyImages(
    document: SvgDocument,
    markerId: String,
    images: Map<String, ByteArray>,
  ): Boolean {
    var complete = true
    document.remoteImageHrefs.forEachIndexed { index, href ->
      val data = images[href]
      if (data == null) {
        complete = false
        return@forEachIndexed
      }
      if (document.resolveImage(index, data)) return@forEachIndexed
      val png = data.toPng()
      if (png == null || !document.resolveImage(index, png)) {
        complete = false
        mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId remote svg image decode failed: $href")
      }
    }
    return complete
  }

  private suspend fun fetchAll(
    hrefs: List<String>,
    markerId: String,
  ): Map<String, ByteArray> =
    coroutineScope {
      hrefs
        .map { href -> async { fetch(href, markerId)?.let { href to it } } }
        .awaitAll()
        .filterNotNull()
        .toMap()
    }

  private suspend fun fetch(
    href: String,
    markerId: String,
  ): ByteArray? {
    cache.get(href)?.let { return it }
    val download =
      downloads.computeIfAbsent(href) {
        scope.async(start = CoroutineStart.LAZY) { download(href).also { cache.put(href, it) } }
      }
    download.invokeOnCompletion { downloads.remove(href, download) }
    download.start()
    return try {
      download.await()
    } catch (e: CancellationException) {
      throw e
    } catch (t: Throwable) {
      mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId remote svg image fetch failed: $href", t)
      null
    }
  }

  private fun download(href: String): ByteArray {
    var url = URL(href)
    repeat(MAX_REDIRECTS + 1) {
      val conn =
        (url.openConnection() as HttpURLConnection).apply {
          connectTimeout = TIMEOUT_MS
          readTimeout = TIMEOUT_MS
          requestMethod = "GET"
          instanceFollowRedirects = false
        }
      try {
        conn.connect()
        val location = conn.getHeaderField("Location")
        if (conn.responseCode in 300..399 && location != null) {
          url = URL(url, location)
          check(url.protocol == "http" || url.protocol == "https") { "redirect to ${url.protocol}" }
          return@repeat
        }
        if (conn.responseCode !in 200..299) error("HTTP ${conn.responseCode}")
        return conn.inputStream.use { it.readAtMost(MAX_IMAGE_BYTES) }
      } finally {
        conn.disconnect()
      }
    }
    error("too many redirects")
  }
}
