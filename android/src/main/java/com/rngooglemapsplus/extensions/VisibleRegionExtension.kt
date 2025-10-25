package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.VisibleRegion
import com.rngooglemapsplus.RNRegion

fun VisibleRegion.toRnRegion(): RNRegion =
  RNRegion(
    nearLeft = nearLeft.toRnLatLng(),
    nearRight = nearRight.toRnLatLng(),
    farLeft = farLeft.toRnLatLng(),
    farRight = farRight.toRnLatLng(),
    latLngBounds = latLngBounds.toRnLatLngBounds(),
  )
