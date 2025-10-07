package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.ButtCap
import com.google.android.gms.maps.model.Cap
import com.google.android.gms.maps.model.JointType
import com.google.android.gms.maps.model.PolylineOptions
import com.google.android.gms.maps.model.RoundCap
import com.google.android.gms.maps.model.SquareCap
import com.rngooglemapsplus.extensions.toColor

class MapPolylineBuilder {
  fun buildPolylineOptions(pl: RNPolyline): PolylineOptions =
    PolylineOptions().apply {
      pl.coordinates.forEach { pt ->
        add(
          com.google.android.gms.maps.model
            .LatLng(pt.latitude, pt.longitude),
        )
      }
      pl.width?.let { width(it.dpToPx()) }
      pl.lineCap?.let { startCap(mapLineCap(it)) }
      pl.lineCap?.let { endCap(mapLineCap(it)) }
      pl.lineJoin?.let { jointType(mapLineJoin(it)) }
      pl.color?.let { color(it.toColor()) }
      pl.pressable?.let { clickable(it) }
      pl.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun mapLineCap(type: RNLineCapType?): Cap =
    when (type) {
      RNLineCapType.ROUND -> RoundCap()
      RNLineCapType.SQUARE -> SquareCap()
      else -> ButtCap()
    }

  fun mapLineJoin(type: RNLineJoinType?): Int =
    when (type) {
      RNLineJoinType.ROUND -> JointType.ROUND
      RNLineJoinType.BEVEL -> JointType.BEVEL
      RNLineJoinType.MITER -> JointType.DEFAULT
      null -> JointType.DEFAULT
    }
}
