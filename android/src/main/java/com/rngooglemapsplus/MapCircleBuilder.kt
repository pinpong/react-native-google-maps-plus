package com.rngooglemapsplus

import android.graphics.Color
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.CircleOptions
import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.extensions.toColor

class MapCircleBuilder {
  fun build(circle: RNCircle): CircleOptions =
    CircleOptions().apply {
      center(LatLng(circle.center.latitude, circle.center.longitude))
      radius(circle.radius)
      circle.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      circle.strokeColor?.let { strokeColor(it.toColor()) }
      circle.fillColor?.let { fillColor(it.toColor()) }
      circle.pressable?.let { clickable(it) }
      circle.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    circle: Circle,
    next: RNCircle,
  ) {
    circle.center = LatLng(next.center.latitude, next.center.longitude)
    circle.radius = next.radius
    circle.strokeWidth = next.strokeWidth?.dpToPx() ?: 1f
    circle.strokeColor = next.strokeColor?.toColor() ?: Color.BLACK
    circle.fillColor = next.fillColor?.toColor() ?: Color.TRANSPARENT
    circle.zIndex = next.zIndex?.toFloat() ?: 0f
  }
}
