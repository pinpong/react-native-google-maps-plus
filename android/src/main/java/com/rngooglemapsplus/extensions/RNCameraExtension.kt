package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.RNCamera

fun RNCamera.toCameraPosition(current: CameraPosition?): CameraPosition {
  val builder = CameraPosition.builder()

  builder.target(center?.toLatLng() ?: current?.target ?: LatLng(0.0, 0.0))

  zoom?.let { builder.zoom(it.toFloat()) }
  bearing?.let { builder.bearing(it.toFloat()) }
  tilt?.let { builder.tilt(it.toFloat()) }

  return builder.build()
}
