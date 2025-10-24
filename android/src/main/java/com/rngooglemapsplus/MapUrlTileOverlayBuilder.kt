package com.rngooglemapsplus

import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.android.gms.maps.model.UrlTileProvider
import java.net.URL

class MapUrlTileOverlayBuilder {
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
}
