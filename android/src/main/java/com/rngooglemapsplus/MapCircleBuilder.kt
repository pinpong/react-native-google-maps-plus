package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.CircleOptions
import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.extensions.toColor

class MapCircleBuilder {
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
