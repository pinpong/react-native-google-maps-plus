package com.rngooglemapsplus

import MarkerTag
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Typeface
import android.graphics.drawable.PictureDrawable
import android.util.Base64
import android.util.LruCache
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.graphics.createBitmap
import com.caverock.androidsvg.SVG
import com.caverock.androidsvg.SVGExternalFileResolver
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.rngooglemapsplus.extensions.anchorEquals
import com.rngooglemapsplus.extensions.coordinatesEquals
import com.rngooglemapsplus.extensions.infoWindowAnchorEquals
import com.rngooglemapsplus.extensions.markerInfoWindowStyleEquals
import com.rngooglemapsplus.extensions.markerStyleEquals
import com.rngooglemapsplus.extensions.onUi
import com.rngooglemapsplus.extensions.styleHash
import com.rngooglemapsplus.extensions.toLatLng
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLDecoder
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.coroutineContext

class MapMarkerBuilder(
  val context: ThemedReactContext,
  private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
) {
  private val iconCache =
    object : LruCache<Int, BitmapDescriptor>(256) {
      override fun sizeOf(
        key: Int,
        value: BitmapDescriptor,
      ): Int = 1
    }

  private val jobsById = ConcurrentHashMap<String, Job>()

  init {
    // / TODO: refactor with androidsvg 1.5 release
    SVG.registerExternalFileResolver(
      object : SVGExternalFileResolver() {
        override fun resolveImage(filename: String?): Bitmap? {
          if (filename.isNullOrBlank()) return null

          return runCatching {
            when {
              filename.startsWith("data:image/svg+xml") -> {
                val svgContent =
                  if ("base64," in filename) {
                    val base64 = filename.substringAfter("base64,")
                    String(Base64.decode(base64, Base64.DEFAULT), Charsets.UTF_8)
                  } else {
                    URLDecoder.decode(filename.substringAfter(","), "UTF-8")
                  }

                val svg = SVG.getFromString(svgContent)
                val width = (svg.documentWidth.takeIf { it > 0 } ?: 128f).toInt()
                val height = (svg.documentHeight.takeIf { it > 0 } ?: 128f).toInt()

                createBitmap(width, height).apply {
                  density = context.resources.displayMetrics.densityDpi
                  Canvas(this).also {
                    svg.renderToCanvas(it)
                  }
                }
              }

              filename.startsWith("http://") || filename.startsWith("https://") -> {
                val conn =
                  (URL(filename).openConnection() as HttpURLConnection).apply {
                    connectTimeout = 5000
                    readTimeout = 5000
                    requestMethod = "GET"
                    instanceFollowRedirects = true
                  }
                conn.connect()

                val contentType = conn.contentType ?: ""
                val result =
                  if (contentType.contains("svg") || filename.endsWith(".svg")) {
                    val svgText = conn.inputStream.bufferedReader().use { it.readText() }
                    val innerSvg = SVG.getFromString(svgText)
                    val w = innerSvg.documentWidth.takeIf { it > 0 } ?: 128f
                    val h = innerSvg.documentHeight.takeIf { it > 0 } ?: 128f
                    createBitmap(w.toInt(), h.toInt()).apply {
                      density = context.resources.displayMetrics.densityDpi
                      Canvas(this).also {
                        innerSvg.renderToCanvas(it)
                      }
                    }
                  } else {
                    conn.inputStream.use { BitmapFactory.decodeStream(it) }
                  }

                conn.disconnect()
                result
              }

              else -> null
            }
          }.getOrNull()
        }

        override fun resolveFont(
          fontFamily: String?,
          fontWeight: Int,
          fontStyle: String?,
        ): Typeface? {
          if (fontFamily.isNullOrBlank()) return null

          return runCatching {
            val assetManager = context.assets

            val candidates =
              listOf(
                "fonts/$fontFamily.ttf",
                "fonts/$fontFamily.otf",
              )

            for (path in candidates) {
              try {
                return Typeface.createFromAsset(assetManager, path)
              } catch (_: Throwable) {
                // / ignore
              }
            }

            Typeface.create(fontFamily, Typeface.NORMAL)
          }.getOrElse {
            Typeface.create(fontFamily, fontWeight)
          }
        }

        override fun isFormatSupported(mimeType: String?): Boolean = mimeType?.startsWith("image/") == true
      },
    )
  }

  fun build(
    m: RNMarker,
    icon: BitmapDescriptor?,
  ): MarkerOptions =
    MarkerOptions().apply {
      position(m.coordinate.toLatLng())
      icon(icon)
      m.title?.let { title(it) }
      m.snippet?.let { snippet(it) }
      m.opacity?.let { alpha(it.toFloat()) }
      m.flat?.let { flat(it) }
      m.draggable?.let { draggable(it) }
      m.rotation?.let { rotation(it.toFloat()) }
      m.infoWindowAnchor?.let { infoWindowAnchor(it.x.toFloat(), it.y.toFloat()) }
      m.anchor?.let { anchor((m.anchor.x).toFloat(), (m.anchor.y).toFloat()) }
      m.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    prev: RNMarker,
    next: RNMarker,
    marker: Marker,
  ) = onUi {
    if (!prev.coordinatesEquals(next)) {
      marker.position = next.coordinate.toLatLng()
    }

    if (!prev.markerStyleEquals(next)) {
      buildIconAsync(next) { icon ->
        marker.setIcon(icon)
        if (!prev.anchorEquals(next)) {
          marker.setAnchor(
            (next.anchor?.x ?: 0.5f).toFloat(),
            (next.anchor?.y ?: 1.0f).toFloat(),
          )
        }
        if (!prev.infoWindowAnchorEquals(next)) {
          marker.setInfoWindowAnchor(
            (next.infoWindowAnchor?.x ?: 0.5f).toFloat(),
            (next.infoWindowAnchor?.y ?: 0f).toFloat(),
          )
        }
      }
    } else {
      if (!prev.anchorEquals(next)) {
        marker.setAnchor(
          (next.anchor?.x ?: 0.5f).toFloat(),
          (next.anchor?.y ?: 1.0f).toFloat(),
        )
      }
      if (!prev.infoWindowAnchorEquals(next)) {
        marker.setInfoWindowAnchor(
          (next.infoWindowAnchor?.x ?: 0.5f).toFloat(),
          (next.infoWindowAnchor?.y ?: 0f).toFloat(),
        )
      }
    }

    if (prev.title != next.title) {
      marker.title = next.title
    }

    if (prev.snippet != next.snippet) {
      marker.snippet = next.snippet
    }

    if (prev.opacity != next.opacity) {
      marker.alpha = next.opacity?.toFloat() ?: 1f
    }

    if (prev.flat != next.flat) {
      marker.isFlat = next.flat ?: false
    }

    if (prev.draggable != next.draggable) {
      marker.isDraggable = next.draggable ?: false
    }

    if (prev.rotation != next.rotation) {
      marker.rotation = next.rotation?.toFloat() ?: 0f
    }

    if (prev.zIndex != next.zIndex) {
      marker.zIndex = next.zIndex?.toFloat() ?: 0f
    }

    if (!prev.markerInfoWindowStyleEquals(next)) {
      marker.tag = MarkerTag(id = next.id, iconSvg = next.infoWindowIconSvg)
    }
  }

  fun buildIconAsync(
    m: RNMarker,
    onReady: (BitmapDescriptor?) -> Unit,
  ) {
    jobsById[m.id]?.cancel()

    m.iconSvg ?: return onReady(null)

    val key = m.styleHash()
    iconCache.get(key)?.let { cached ->
      onReady(cached)
      return
    }

    val job =
      scope.launch {
        try {
          ensureActive()
          val bmp = renderBitmap(m)

          if (bmp == null) {
            withContext(Dispatchers.Main) { onReady(null) }
            return@launch
          }
          ensureActive()
          val desc = BitmapDescriptorFactory.fromBitmap(bmp)

          iconCache.put(key, desc)
          bmp.recycle()

          withContext(Dispatchers.Main) {
            ensureActive()
            onReady(desc)
          }
        } catch (_: OutOfMemoryError) {
          clearIconCache()
          withContext(Dispatchers.Main) {
            ensureActive()
            onReady(null)
          }
        } catch (_: Throwable) {
          withContext(Dispatchers.Main) {
            ensureActive()
            onReady(null)
          }
        } finally {
          jobsById.remove(m.id)
        }
      }

    jobsById[m.id] = job
  }

  fun cancelIconJob(id: String) {
    jobsById[id]?.cancel()
    jobsById.remove(id)
  }

  fun cancelAllJobs() {
    val ids = jobsById.keys.toList()
    ids.forEach { id ->
      jobsById[id]?.cancel()
    }
    jobsById.clear()
    clearIconCache()
  }

  fun clearIconCache() {
    iconCache.evictAll()
  }

  fun buildInfoWindow(iconSvg: RNMarkerSvg?): ImageView? {
    val iconSvg = iconSvg ?: return null

    val svgView =
      ImageView(context).apply {
        layoutParams =
          LinearLayout.LayoutParams(
            iconSvg.width.dpToPx().toInt(),
            iconSvg.height.dpToPx().toInt(),
          )
      }

    try {
      val svg = SVG.getFromString(iconSvg.svgString)
      svg.setDocumentWidth(iconSvg.width.dpToPx())
      svg.setDocumentHeight(iconSvg.height.dpToPx())
      val drawable = PictureDrawable(svg.renderToPicture())
      svgView.setImageDrawable(drawable)
    } catch (e: Exception) {
      return null
    }

    return svgView
  }

  private suspend fun renderBitmap(m: RNMarker): Bitmap? {
    m.iconSvg ?: return null

    var bmp: Bitmap? = null
    try {
      coroutineContext.ensureActive()
      val svg = SVG.getFromString(m.iconSvg.svgString)

      val wPx =
        m.iconSvg.width
          .dpToPx()
          .toInt()
      val hPx =
        m.iconSvg.height
          .dpToPx()
          .toInt()

      coroutineContext.ensureActive()
      svg.setDocumentWidth(wPx.toFloat())
      svg.setDocumentHeight(hPx.toFloat())

      coroutineContext.ensureActive()
      bmp =
        createBitmap(wPx, hPx, Bitmap.Config.ARGB_8888).apply {
          density = context.resources.displayMetrics.densityDpi
          Canvas(this).also {
            svg.renderToCanvas(it)
          }
        }

      return bmp
    } catch (t: Throwable) {
      try {
        bmp?.recycle()
      } catch (_: Throwable) {
      }
      throw t
    }
  }
}
