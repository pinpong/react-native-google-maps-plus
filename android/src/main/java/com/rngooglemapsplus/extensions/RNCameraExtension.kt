package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.rngooglemapsplus.RNCamera

fun RNCamera.toCameraPosition(): CameraPosition {
  val builder = CameraPosition.builder()

  center?.let {
    builder.target(it.toLatLng())
  }

  zoom?.let { builder.zoom(it.toFloat()) }
  bearing?.let { builder.bearing(it.toFloat()) }
  tilt?.let { builder.tilt(it.toFloat()) }

  return builder.build()
}
