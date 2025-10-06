package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.CircleOptions
import com.google.android.gms.maps.model.LatLng

class MapCircleOptions {
  fun buildCircleOptions(circle: RNCircle): CircleOptions =
    CircleOptions().apply {
      center(LatLng(circle.center.latitude, circle.center.longitude))
      circle.radius?.let { radius(it) }
      circle.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      circle.strokeColor?.let { strokeColor(it.toColor()) }
      circle.fillColor?.let { fillColor(it.toColor()) }
      circle.pressable?.let { clickable(it) }
      circle.zIndex?.let { zIndex(it.toFloat()) }
    }
}

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
