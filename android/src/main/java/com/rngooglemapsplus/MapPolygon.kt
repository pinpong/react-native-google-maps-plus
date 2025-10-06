package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.PolygonOptions

class MapPolygonOptions {
  fun buildPolygonOptions(poly: RNPolygon): PolygonOptions =
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
}

fun RNPolygon.polygonEquals(b: RNPolygon): Boolean {
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if (strokeWidth != b.strokeWidth) return false
  if (fillColor != b.fillColor) return false
  if (strokeColor != b.strokeColor) return false
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
