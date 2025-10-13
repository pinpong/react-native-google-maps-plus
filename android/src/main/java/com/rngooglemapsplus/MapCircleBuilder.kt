package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.CircleOptions
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toLatLng

class MapCircleBuilder {
  fun build(circle: RNCircle): CircleOptions =
    CircleOptions().apply {
      center(circle.center.toLatLng())
      radius(circle.radius)
      circle.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      circle.strokeColor?.let { strokeColor(it.toColor()) }
      circle.fillColor?.let { fillColor(it.toColor()) }
      circle.pressable?.let { clickable(it) }
      circle.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    prev: RNCircle,
    next: RNCircle,
    circle: Circle,
  ) {
    if (prev.center.latitude != next.center.latitude ||
      prev.center.longitude != next.center.longitude
    ) {
      circle.center = next.center.toLatLng()
    }

    if (prev.radius != next.radius) {
      circle.radius = next.radius
    }

    if (prev.strokeWidth != next.strokeWidth) {
      circle.strokeWidth = next.strokeWidth?.dpToPx() ?: 1f
    }

    if (prev.strokeColor != next.strokeColor) {
      circle.strokeColor = next.strokeColor?.toColor() ?: Color.BLACK
    }

    if (prev.fillColor != next.fillColor) {
      circle.fillColor = next.fillColor?.toColor() ?: Color.TRANSPARENT
    }

    if (prev.pressable != next.pressable) {
      circle.isClickable = next.pressable ?: false
    }

    if (prev.zIndex != next.zIndex) {
      circle.zIndex = next.zIndex?.toFloat() ?: 0f
    }
  }
}
