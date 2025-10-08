package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.PolygonOptions
import com.rngooglemapsplus.extensions.toColor

class MapPolygonBuilder {
  fun build(poly: RNPolygon): PolygonOptions =
    PolygonOptions().apply {
      poly.coordinates.forEach { pt ->
        add(
          com.google.android.gms.maps.model
            .LatLng(pt.latitude, pt.longitude),
        )
      }
      poly.fillColor?.let { fillColor(it.toColor()) }
      poly.strokeColor?.let { strokeColor(it.toColor()) }
      poly.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      poly.pressable?.let { clickable(it) }
      poly.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    gmsPoly: Polygon,
    next: RNPolygon,
  ) {
    gmsPoly.points =
      next.coordinates.map {
        LatLng(it.latitude, it.longitude)
      }
    gmsPoly.fillColor = next.fillColor?.toColor() ?: Color.TRANSPARENT
    gmsPoly.strokeColor = next.strokeColor?.toColor() ?: Color.BLACK
    gmsPoly.strokeWidth = next.strokeWidth?.dpToPx() ?: 1f
    gmsPoly.zIndex = next.zIndex?.toFloat() ?: 0f
  }
}
