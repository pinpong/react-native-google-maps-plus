package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.RNCamera

fun RNCamera.toCameraPosition(): CameraPosition {
  val builder = CameraPosition.builder()

  center?.let {
    builder.target(LatLng(it.latitude, it.longitude))
  }

  zoom?.let { builder.zoom(it.toFloat()) }
  bearing?.let { builder.bearing(it.toFloat()) }
  tilt?.let { builder.tilt(it.toFloat()) }

  return builder.build()
}
