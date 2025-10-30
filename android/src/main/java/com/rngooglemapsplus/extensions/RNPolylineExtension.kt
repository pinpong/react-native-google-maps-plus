package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNPolyline

fun RNPolyline.polylineEquals(b: RNPolyline): Boolean {
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if (width != b.width) return false
  if (lineCap != b.lineCap) return false
  if (lineJoin != b.lineJoin) return false
  if (geodesic != b.geodesic) return false
  if (color != b.color) return false
  if (!coordinatesEquals(b)) return false
  return true
}

fun RNPolyline.coordinatesEquals(b: RNPolyline): Boolean {
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
