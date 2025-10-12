package com.rngooglemapsplus

import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.LruCache
import androidx.core.graphics.createBitmap
import com.caverock.androidsvg.SVG
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.rngooglemapsplus.extensions.markerStyleEquals
import com.rngooglemapsplus.extensions.styleHash
import com.rngooglemapsplus.extensions.toLatLng
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
    marker: Marker,
    prev: RNMarker,
    next: RNMarker,
  ) {
    marker.position =
      next.coordinate.toLatLng()

    if (!prev.markerStyleEquals(next)) {
      buildIconAsync(marker.id, next) { icon ->
        marker.setIcon(icon)
      }
    }
    marker.title = next.title
    marker.snippet = next.snippet
    marker.alpha = next.opacity?.toFloat() ?: 1f
    marker.isFlat = next.flat ?: false
    marker.isDraggable = next.draggable ?: false
    marker.rotation = next.rotation?.toFloat() ?: 0f
    marker.setInfoWindowAnchor(
      (next.infoWindowAnchor?.x ?: 0.5).toFloat(),
      (next.infoWindowAnchor?.y ?: 0).toFloat(),
    )
    marker.setAnchor(
      (next.anchor?.x ?: 0.5).toFloat(),
      (next.anchor?.y ?: 1.0).toFloat(),
    )
    marker.zIndex = next.zIndex?.toFloat() ?: 0f
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
