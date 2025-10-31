package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.rngooglemapsplus.RNCamera
import com.rngooglemapsplus.RNCameraChange

fun CameraPosition.toRnCamera(): RNCameraChange =
  RNCameraChange(
    center = target.toRnLatLng(),
    zoom = zoom.toDouble(),
    bearing = bearing.toDouble(),
    tilt = tilt.toDouble(),
  )
