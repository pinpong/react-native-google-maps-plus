package com.rngooglemapsplus

import android.graphics.Bitmap
import android.util.LruCache
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.graphics.createBitmap
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.model.AdvancedMarkerOptions
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.rngooglemapsplus.extensions.advancedMarkerCollisionBehavior
import com.rngooglemapsplus.extensions.anchorEquals
import com.rngooglemapsplus.extensions.coordinatesEquals
import com.rngooglemapsplus.extensions.infoWindowAnchorEquals
import com.rngooglemapsplus.extensions.markerInfoWindowStyleEquals
import com.rngooglemapsplus.extensions.toGoogleCollisionBehavior
import com.rngooglemapsplus.extensions.toLatLng
import com.rngooglemapsplus.extensions.toPixelSizeOrNull
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.cancellation.CancellationException

class MapMarkerBuilder(
  private val context: ThemedReactContext,
  private val mapErrorHandler: MapErrorHandler,
  private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
) {
  private val imageLoader = SvgImageLoader(mapErrorHandler)
  private val fontRegistry = SvgFontRegistry(context, mapErrorHandler)

  private val iconCache =
    object : LruCache<Int, BitmapDescriptor>(256) {
      override fun sizeOf(
        key: Int,
        value: BitmapDescriptor,
      ): Int = 1
    }

  init {
    scope.launch { fontRegistry.register() }
  }

  fun build(
    m: RNMarker,
    icon: BitmapDescriptor?,
    useAdvancedMarker: Boolean,
  ): MarkerOptions =
    (if (useAdvancedMarker) AdvancedMarkerOptions() else MarkerOptions()).apply {
      position(m.coordinate.toLatLng())
      icon(icon)
      m.title?.let { title(it) }
      m.snippet?.let { snippet(it) }
      m.opacity?.let { alpha(it.toFloat()) }
      m.flat?.let { flat(it) }
      m.draggable?.let { draggable(it) }
      m.rotation?.let { rotation(it.toFloat()) }
      m.infoWindowAnchor?.let { infoWindowAnchor(it.x.toFloat(), it.y.toFloat()) }
      m.anchor?.let { anchor(it.x.toFloat(), it.y.toFloat()) }
      m.zIndex?.let { zIndex(it.toFloat()) }
      if (this is AdvancedMarkerOptions) {
        collisionBehavior(
          m.advancedMarkerCollisionBehavior()?.toGoogleCollisionBehavior()
            ?: AdvancedMarkerOptions.CollisionBehavior.REQUIRED,
        )
      }
    }

  fun update(
    prev: RNMarker,
    next: RNMarker,
    marker: Marker,
    deferAnchors: Boolean = false,
  ) = onUi {
    if (!prev.coordinatesEquals(next)) {
      marker.position = next.coordinate.toLatLng()
    }

    if (!deferAnchors && !prev.anchorEquals(next)) {
      marker.setAnchor(
        (next.anchor?.x ?: 0.5f).toFloat(),
        (next.anchor?.y ?: 1.0f).toFloat(),
      )
    }

    if (!deferAnchors && !prev.infoWindowAnchorEquals(next)) {
      marker.setInfoWindowAnchor(
        (next.infoWindowAnchor?.x ?: 0.5f).toFloat(),
        (next.infoWindowAnchor?.y ?: 0f).toFloat(),
      )
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

  fun applyAnchors(
    m: RNMarker,
    marker: Marker,
  ) {
    marker.setAnchor(
      (m.anchor?.x ?: 0.5f).toFloat(),
      (m.anchor?.y ?: 1.0f).toFloat(),
    )
    marker.setInfoWindowAnchor(
      (m.infoWindowAnchor?.x ?: 0.5f).toFloat(),
      (m.infoWindowAnchor?.y ?: 0f).toFloat(),
    )
  }

  fun cachedIcon(styleHash: Int): BitmapDescriptor? = iconCache.get(styleHash)

  fun renderIcon(
    markerId: String,
    iconSvg: RNMarkerSvg,
    styleHash: Int,
    onReady: (BitmapDescriptor) -> Unit,
  ): Job =
    scope.launch {
      try {
        ensureActive()
        val renderResult = renderBitmap(iconSvg, markerId)

        val desc =
          try {
            ensureActive()
            BitmapDescriptorFactory.fromBitmap(renderResult.bitmap)
          } finally {
            renderResult.bitmap.recycle()
          }

        if (renderResult.cacheable) {
          iconCache.put(styleHash, desc)
        }
        withContext(Dispatchers.Main) {
          ensureActive()
          onReady(desc)
        }
      } catch (e: OutOfMemoryError) {
        mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId renderIcon out of memory", e)
        clearIconCache()
        withContext(Dispatchers.Main) {
          ensureActive()
          onReady(createFallbackDescriptor())
        }
      } catch (_: CancellationException) {
        // cancelled
      } catch (t: Throwable) {
        mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId renderIcon failed", t)
        withContext(Dispatchers.Main) {
          ensureActive()
          onReady(createFallbackDescriptor())
        }
      }
    }

  fun prefetchInfoWindowImages(
    markerId: String,
    iconSvg: RNMarkerSvg,
    onLoaded: () -> Unit,
  ): Job =
    scope.launch {
      try {
        if (!imageLoader.prefetch(iconSvg.svgString, markerId)) return@launch
        withContext(Dispatchers.Main) {
          ensureActive()
          onLoaded()
        }
      } catch (_: CancellationException) {
        // cancelled
      } catch (t: Throwable) {
        mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId infoWindow: image prefetch failed", t)
      }
    }

  fun clearIconCache() {
    iconCache.evictAll()
    imageLoader.clear()
  }

  fun buildInfoWindow(markerTag: MarkerTag): ImageView? {
    val iconSvg = markerTag.iconSvg ?: return null

    val size = iconSvg.toPixelSizeOrNull()
    if (size == null) {
      mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "markerId=${markerTag.id} infoWindow: invalid svg size")
      return createFallbackImageView()
    }
    val wPx = size.width
    val hPx = size.height

    val svgView =
      ImageView(context).apply {
        layoutParams = LinearLayout.LayoutParams(wPx, hPx)
      }

    try {
      parse(iconSvg, wPx, hPx).use {
        if (!it.isValid) {
          mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "markerId=${markerTag.id} infoWindow: svg parse failed")
          return createFallbackImageView()
        }
        imageLoader.resolveCachedImages(it, markerTag.id)
        val bmp = render(it, wPx, hPx)
        if (bmp == null) {
          mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=${markerTag.id} infoWindow: svg render failed")
          return createFallbackImageView()
        }
        svgView.setImageBitmap(bmp)
      }
    } catch (t: Throwable) {
      mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=${markerTag.id} infoWindow: svg render failed", t)
      return createFallbackImageView()
    }

    return svgView
  }

  private fun createFallbackImageView(): ImageView = ImageView(context)

  private fun createFallbackBitmap(): Bitmap =
    createBitmap(1, 1, Bitmap.Config.ARGB_8888).apply {
      setHasAlpha(true)
    }

  private fun createFallbackDescriptor(): BitmapDescriptor {
    val bmp = createFallbackBitmap()
    return BitmapDescriptorFactory.fromBitmap(bmp).also {
      bmp.recycle()
    }
  }

  private data class RenderBitmapResult(
    val bitmap: Bitmap,
    val cacheable: Boolean,
  )

  private suspend fun renderBitmap(
    iconSvg: RNMarkerSvg,
    markerId: String,
  ): RenderBitmapResult {
    val size = iconSvg.toPixelSizeOrNull()
    if (size == null) {
      mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "markerId=$markerId icon: invalid svg size")
      return RenderBitmapResult(createFallbackBitmap(), false)
    }
    val wPx = size.width
    val hPx = size.height

    return parse(iconSvg, wPx, hPx).use {
      if (!it.isValid) {
        mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "markerId=$markerId icon: svg parse failed")
        return RenderBitmapResult(createFallbackBitmap(), false)
      }
      val complete = imageLoader.resolveImages(it, markerId)

      currentCoroutineContext().ensureActive()
      val bmp = render(it, wPx, hPx)
      if (bmp == null) {
        mapErrorHandler.report(RNMapErrorCode.MARKER_ICON_BUILD_FAILED, "markerId=$markerId icon: svg render failed")
        return RenderBitmapResult(createFallbackBitmap(), false)
      }

      RenderBitmapResult(bmp, complete)
    }
  }

  private fun parse(
    iconSvg: RNMarkerSvg,
    wPx: Int,
    hPx: Int,
  ): SvgDocument {
    fontRegistry.register()
    return SvgDocument(iconSvg.svgString, wPx, hPx)
  }

  private fun render(
    document: SvgDocument,
    wPx: Int,
    hPx: Int,
  ): Bitmap? {
    val bmp = createBitmap(wPx, hPx, Bitmap.Config.ARGB_8888)
    if (!document.render(bmp)) {
      bmp.recycle()
      return null
    }
    bmp.density = context.resources.displayMetrics.densityDpi
    return bmp
  }
}
