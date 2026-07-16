package com.rngooglemapsplus

import com.google.android.gms.maps.model.TileOverlay
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.android.gms.maps.model.UrlTileProvider
import java.net.URL

class MapUrlTileOverlayBuilder(
  private val mapErrorHandler: MapErrorHandler,
) {
  fun build(t: RNUrlTileOverlay): TileOverlayOptions {
    val provider =
      object : UrlTileProvider(
        t.tileSize.toInt(),
        t.tileSize.toInt(),
      ) {
        override fun getTileUrl(
          x: Int,
          y: Int,
          zoom: Int,
        ): URL? {
          val url =
            t.url
              .replace("{x}", x.toString())
              .replace("{y}", y.toString())
              .replace("{z}", zoom.toString())

          return try {
            URL(url)
          } catch (e: Exception) {
            mapErrorHandler.report(RNMapErrorCode.TILE_OVERLAY_FAILED, "tile url invalid: $url", e)
            null
          }
        }
      }

    val opts = TileOverlayOptions().tileProvider(provider)

    t.fadeIn?.let { opts.fadeIn(it) }
    t.zIndex?.let { opts.zIndex(it.toFloat()) }
    t.opacity?.let { opts.transparency(1f - it.toFloat()) }
    return opts
  }

  fun update(
    prev: RNUrlTileOverlay,
    next: RNUrlTileOverlay,
    overlay: TileOverlay,
  ) = onUi {
    if (prev.zIndex != next.zIndex) {
      overlay.zIndex = next.zIndex?.toFloat() ?: 0f
    }

    if (prev.opacity != next.opacity) {
      overlay.transparency = next.opacity?.let { 1f - it.toFloat() } ?: 0f
    }

    if (prev.fadeIn != next.fadeIn) {
      overlay.fadeIn = next.fadeIn ?: true
    }
  }
}
