package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.rngooglemapsplus.RNCamera

fun CameraPosition.toRNCamera(): RNCamera =
  RNCamera(
    center = target.toRNLatLng(),
    zoom = zoom.toDouble(),
    bearing = bearing.toDouble(),
    tilt = tilt.toDouble(),
  )
