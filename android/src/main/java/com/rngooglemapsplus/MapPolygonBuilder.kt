package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.PolygonOptions
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toLatLng

class MapPolygonBuilder {
  fun build(poly: RNPolygon): PolygonOptions =
    PolygonOptions().apply {
      poly.coordinates.forEach { pt ->
        add(
          pt.toLatLng(),
        )
      }
      poly.fillColor?.let { fillColor(it.toColor()) }
      poly.strokeColor?.let { strokeColor(it.toColor()) }
      poly.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      poly.pressable?.let { clickable(it) }
      poly.geodesic?.let { geodesic(it) }
      poly.holes?.forEach { hole ->
        addHole(hole.coordinates.map { it.toLatLng() })
      }
      poly.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    poly: Polygon,
    next: RNPolygon,
  ) {
    poly.points =
      next.coordinates.map {
        it.toLatLng()
      }
    poly.fillColor = next.fillColor?.toColor() ?: Color.TRANSPARENT
    poly.strokeColor = next.strokeColor?.toColor() ?: Color.BLACK
    poly.strokeWidth = next.strokeWidth?.dpToPx() ?: 1f
    poly.isClickable = next.pressable ?: false
    poly.isGeodesic = next.geodesic ?: false
    poly.holes = next.holes?.map { hole ->
      hole.coordinates.map { it.toLatLng() }
    } ?: emptyList()
    poly.zIndex = next.zIndex?.toFloat() ?: 0f
  }
}
