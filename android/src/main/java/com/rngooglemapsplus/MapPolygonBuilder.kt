package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.PolygonOptions
import com.rngooglemapsplus.extensions.coordinatesEquals
import com.rngooglemapsplus.extensions.holesEquals
import com.rngooglemapsplus.extensions.onUi
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toLatLng
import com.rngooglemapsplus.extensions.toMapsPolygonHoles

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
    prev: RNPolygon,
    next: RNPolygon,
    poly: Polygon,
  ) = onUi {
    if (!prev.coordinatesEquals(next)) {
      poly.points = next.coordinates.map { it.toLatLng() }
    }

    if (!prev.holesEquals(next)) {
      poly.holes = next.holes?.toMapsPolygonHoles() ?: emptyList()
    }

    if (prev.fillColor != next.fillColor) {
      poly.fillColor = next.fillColor?.toColor() ?: Color.TRANSPARENT
    }

    if (prev.strokeColor != next.strokeColor) {
      poly.strokeColor = next.strokeColor?.toColor() ?: Color.BLACK
    }

    if (prev.strokeWidth != next.strokeWidth) {
      poly.strokeWidth = next.strokeWidth?.dpToPx() ?: 1f
    }

    if (prev.pressable != next.pressable) {
      poly.isClickable = next.pressable ?: false
    }

    if (prev.geodesic != next.geodesic) {
      poly.isGeodesic = next.geodesic ?: false
    }

    if (prev.zIndex != next.zIndex) {
      poly.zIndex = next.zIndex?.toFloat() ?: 0f
    }
  }
}
