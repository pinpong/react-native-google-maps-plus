package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.StreetViewPanoramaCamera
import com.rngooglemapsplus.RNStreetViewCamera

fun RNStreetViewCamera.toStreetViewPanoramaCamera(current: StreetViewPanoramaCamera? = null): StreetViewPanoramaCamera =
  StreetViewPanoramaCamera
    .Builder()
    .bearing(bearing?.toFloat() ?: current?.bearing ?: 0f)
    .tilt(tilt?.toFloat() ?: current?.tilt ?: 0f)
    .zoom(zoom?.toFloat() ?: current?.zoom ?: 0f)
    .build()
