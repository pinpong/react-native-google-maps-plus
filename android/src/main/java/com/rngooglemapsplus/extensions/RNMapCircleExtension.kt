package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNCircle

fun RNCircle.circleEquals(b: RNCircle): Boolean {
  if (!centerEquals(b)) return false
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if (radius != b.radius) return false
  if (strokeWidth != b.strokeWidth) return false
  if (strokeColor != b.strokeColor) return false
  if (fillColor != b.fillColor) return false
  return true
}

fun RNCircle.centerEquals(b: RNCircle): Boolean {
  if (center.latitude != b.center.latitude) return false
  if (center.longitude != b.center.longitude) return false
  return true
}
