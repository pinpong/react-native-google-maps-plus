package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.RNPolygon
import com.rngooglemapsplus.RNPolygonHole

fun RNPolygon.polygonEquals(b: RNPolygon): Boolean {
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if (strokeWidth != b.strokeWidth) return false
  if (fillColor != b.fillColor) return false
  if (strokeColor != b.strokeColor) return false
  if (geodesic != b.geodesic) return false
  if (!coordinatesEquals(b)) return false
  if (!holesEquals(b)) return false
  return true
}

fun RNPolygon.coordinatesEquals(b: RNPolygon): Boolean {
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

fun RNPolygon.holesEquals(b: RNPolygon): Boolean {
  if (holes?.size != b.holes?.size) return false
  if (holes != null && b.holes != null) {
    for (i in holes.indices) {
      val ah = holes[i]
      val bh = b.holes[i]

      if (ah.coordinates.size != bh.coordinates.size) return false
      for (j in ah.coordinates.indices) {
        val p = ah.coordinates[j]
        val q = bh.coordinates[j]
        if (p.latitude != q.latitude || p.longitude != q.longitude) return false
      }
    }
  }
  return true
}

fun Array<RNPolygonHole>.toMapsPolygonHoles(): List<List<LatLng>> =
  this.map { hole ->
    hole.coordinates.map { it.toLatLng() }
  }
