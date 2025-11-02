package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.RNCameraUpdate

fun RNCameraUpdate.toCameraPosition(current: CameraPosition?) =
  CameraPosition
    .builder()
    .target(center?.toLatLng() ?: current?.target ?: LatLng(0.0, 0.0))
    .zoom(zoom?.toFloat() ?: current?.zoom ?: 0f)
    .bearing(bearing?.toFloat() ?: current?.bearing ?: 0f)
    .tilt(tilt?.toFloat() ?: current?.tilt ?: 0f)
    .build()
