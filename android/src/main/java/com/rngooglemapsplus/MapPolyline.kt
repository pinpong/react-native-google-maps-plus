package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.ButtCap
import com.google.android.gms.maps.model.Cap
import com.google.android.gms.maps.model.JointType
import com.google.android.gms.maps.model.PolylineOptions
import com.google.android.gms.maps.model.RoundCap
import com.google.android.gms.maps.model.SquareCap

class MapPolylineOptions {
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

fun RNPolyline.polylineEquals(b: RNPolyline): Boolean {
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if ((width ?: 0.0) != (b.width ?: 0.0)) return false
  if (lineCap != b.lineCap) return false
  if (lineJoin != b.lineJoin) return false
  if (color != b.color) return false
  val ac = coordinates
  val bc = b.coordinates
  if (ac.size != bc.size) return false
  for (i in ac.indices) {
    val p = ac[i]
    val q = bc[i]
    if (p.latitude != q.latitude || p.longitude != q.longitude) return false
  }
  return true
}
