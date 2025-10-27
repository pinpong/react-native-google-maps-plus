package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.ButtCap
import com.google.android.gms.maps.model.Cap
import com.google.android.gms.maps.model.JointType
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions
import com.google.android.gms.maps.model.RoundCap
import com.google.android.gms.maps.model.SquareCap
import com.rngooglemapsplus.extensions.onUi
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toLatLng

class MapPolylineBuilder {
  fun build(pl: RNPolyline): PolylineOptions =
    PolylineOptions().apply {
      pl.coordinates.forEach { pt ->
        add(pt.toLatLng())
      }
      pl.width?.let { width(it.dpToPx()) }
      pl.lineCap?.let {
        startCap(mapLineCap(it))
        endCap(mapLineCap(it))
      }
      pl.lineJoin?.let { jointType(mapLineJoin(it)) }
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
    val coordsChanged =
      prev.coordinates.size != next.coordinates.size ||
        !prev.coordinates.zip(next.coordinates).all { (a, b) ->
          a.latitude == b.latitude && a.longitude == b.longitude
        }

    if (coordsChanged) {
      polyline.points = next.coordinates.map { it.toLatLng() }
    }

    if (prev.width != next.width) {
      polyline.width = next.width?.dpToPx() ?: 1f
    }

    val newCap = mapLineCap(next.lineCap ?: RNLineCapType.BUTT)
    val prevCap = mapLineCap(prev.lineCap ?: RNLineCapType.BUTT)
    if (newCap != prevCap) {
      polyline.startCap = newCap
      polyline.endCap = newCap
    }

    val newJoin = mapLineJoin(next.lineJoin ?: RNLineJoinType.MITER)
    val prevJoin = mapLineJoin(prev.lineJoin ?: RNLineJoinType.MITER)
    if (newJoin != prevJoin) {
      polyline.jointType = newJoin
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

  private fun mapLineCap(type: RNLineCapType?): Cap =
    when (type) {
      RNLineCapType.ROUND -> RoundCap()
      RNLineCapType.SQUARE -> SquareCap()
      else -> ButtCap()
    }

  private fun mapLineJoin(type: RNLineJoinType?): Int =
    when (type) {
      RNLineJoinType.ROUND -> JointType.ROUND
      RNLineJoinType.BEVEL -> JointType.BEVEL
      RNLineJoinType.MITER -> JointType.DEFAULT
      null -> JointType.DEFAULT
    }
}
