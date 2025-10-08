package com.rngooglemapsplus

import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.LruCache
import androidx.core.graphics.createBitmap
import com.caverock.androidsvg.SVG
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.rngooglemapsplus.extensions.markerStyleEquals
import com.rngooglemapsplus.extensions.styleHash
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.coroutineContext

class MapMarkerBuilder(
  private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
) {
  private val iconCache =
    object : LruCache<Int, BitmapDescriptor>(512) {
      override fun sizeOf(
        key: Int,
        value: BitmapDescriptor,
      ): Int = 1
    }

  private val jobsById = mutableMapOf<String, Job>()

  fun build(
    m: RNMarker,
    icon: BitmapDescriptor?,
  ): MarkerOptions =
    MarkerOptions().apply {
      position(LatLng(m.coordinate.latitude, m.coordinate.longitude))
      anchor((m.anchor?.x ?: 0.5).toFloat(), (m.anchor?.y ?: 0.5).toFloat())
      icon(icon)
      m.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    marker: Marker,
    prev: RNMarker,
    next: RNMarker,
  ) {
    marker.position =
      LatLng(
        next.coordinate.latitude,
        next.coordinate.longitude,
      )
    marker.zIndex = next.zIndex?.toFloat() ?: 0f

    if (!prev.markerStyleEquals(next)) {
      buildIconAsync(marker.id, next) { icon ->
        marker.setIcon(icon)
      }
    }
    marker.setAnchor(
      (next.anchor?.x ?: 0.5).toFloat(),
      (next.anchor?.y ?: 0.5).toFloat(),
    )
  }

  fun buildIconAsync(
    id: String,
    m: RNMarker,
    onReady: (BitmapDescriptor?) -> Unit,
  ) {
    jobsById[id]?.cancel()
    if (m.iconSvg == null) {
      onReady(null)
      return
    }
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
          if (bmp != null) {
            ensureActive()
            val desc = BitmapDescriptorFactory.fromBitmap(bmp)
            iconCache.put(key, desc)
            bmp.recycle()
            withContext(Dispatchers.Main) {
              ensureActive()
              onReady(desc)
            }
          }
        } catch (_: OutOfMemoryError) {
          iconCache.evictAll()
        } catch (_: Throwable) {
        } finally {
          jobsById.remove(id)
        }
      }

    jobsById[id] = job
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
    iconCache.evictAll()
  }

  private suspend fun renderBitmap(m: RNMarker): Bitmap? {
    var bmp: Bitmap? = null
    if (m.iconSvg == null) {
      return null
    }
    try {
      coroutineContext.ensureActive()
      val svg = SVG.getFromString(m.iconSvg.svgString)

      coroutineContext.ensureActive()
      svg.setDocumentWidth(m.iconSvg.width.dpToPx())
      svg.setDocumentHeight(m.iconSvg.height.dpToPx())

      coroutineContext.ensureActive()
      bmp =
        createBitmap(
          m.iconSvg.width
            .dpToPx()
            .toInt(),
          m.iconSvg.height
            .dpToPx()
            .toInt(),
          Bitmap.Config.ARGB_8888,
        )

      coroutineContext.ensureActive()
      val canvas = Canvas(bmp)
      svg.renderToCanvas(canvas)

      coroutineContext.ensureActive()
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
