package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions
import com.rngooglemapsplus.extensions.coordinatesEquals
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toLatLng
import com.rngooglemapsplus.extensions.toMapJointType
import com.rngooglemapsplus.extensions.toMapLineCap

class MapPolylineBuilder {
  fun build(pl: RNPolyline): PolylineOptions =
    PolylineOptions().apply {
      pl.coordinates.forEach { pt ->
        add(pt.toLatLng())
      }
      pl.width?.let { width(it.dpToPx()) }
      pl.lineCap?.let {
        startCap(it.toMapLineCap())
        endCap(it.toMapLineCap())
      }
      pl.lineJoin?.let { jointType(it.toMapJointType()) }
      pl.color?.let { color(it.toColor()) }
      pl.geodesic?.let { geodesic(it) }
      pl.pressable?.let { clickable(it) }
      pl.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    prev: RNPolyline,
    next: RNPolyline,
    polyline: Polyline,
  ) = onUi {
    if (!prev.coordinatesEquals(next)) {
      polyline.points = next.coordinates.map { it.toLatLng() }
    }

    if (prev.width != next.width) {
      polyline.width = next.width?.dpToPx() ?: 1f
    }

    if (prev.lineCap != next.lineCap) {
      polyline.startCap = next.lineCap.toMapLineCap()
      polyline.endCap = next.lineCap.toMapLineCap()
    }

    if (prev.lineJoin != next.lineJoin) {
      polyline.jointType = next.lineJoin.toMapJointType()
    }

    if (prev.color != next.color) {
      polyline.color = next.color?.toColor() ?: Color.BLACK
    }

    if (prev.pressable != next.pressable) {
      polyline.isClickable = next.pressable ?: false
    }

    if (prev.geodesic != next.geodesic) {
      polyline.isGeodesic = next.geodesic ?: false
    }

    if (prev.zIndex != next.zIndex) {
      polyline.zIndex = next.zIndex?.toFloat() ?: 0f
    }
  }
}
