package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNCircle

fun RNCircle.circleEquals(b: RNCircle): Boolean {
  if (zIndex != b.zIndex) return false
  if (pressable != b.pressable) return false
  if (center != b.center) return false
  if (radius != b.radius) return false
  if (strokeWidth != b.strokeWidth) return false
  if (strokeColor != b.strokeColor) return false
  if (fillColor != b.fillColor) return false
  return true
}
