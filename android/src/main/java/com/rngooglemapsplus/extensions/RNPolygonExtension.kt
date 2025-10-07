package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNPolygon

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
