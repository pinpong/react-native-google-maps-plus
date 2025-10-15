package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.rngooglemapsplus.RNCamera

fun CameraPosition.toRnCamera(): RNCamera =
  RNCamera(
    center = target.toRnLatLng(),
    zoom = zoom.toDouble(),
    bearing = bearing.toDouble(),
    tilt = tilt.toDouble(),
  )
