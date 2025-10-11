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
    polyline: Polyline,
    next: RNPolyline,
  ) {
    polyline.points = next.coordinates.map { it.toLatLng() }
    polyline.width = next.width?.dpToPx() ?: 1f
    val cap = mapLineCap(next.lineCap ?: RNLineCapType.BUTT)
    polyline.startCap = cap
    polyline.endCap = cap
    polyline.jointType = mapLineJoin(next.lineJoin ?: RNLineJoinType.MITER)
    polyline.color = next.color?.toColor() ?: Color.BLACK
    polyline.isClickable = next.pressable ?: false
    polyline.isGeodesic = next.geodesic ?: false
    polyline.zIndex = next.zIndex?.toFloat() ?: 0f
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
