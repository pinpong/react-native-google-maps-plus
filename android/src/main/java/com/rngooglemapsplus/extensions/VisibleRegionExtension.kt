package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.VisibleRegion
import com.rngooglemapsplus.RNRegion

fun VisibleRegion.toRNRegion(): RNRegion =
  RNRegion(
    nearLeft = nearLeft.toRNLatLng(),
    nearRight = nearRight.toRNLatLng(),
    farLeft = farLeft.toRNLatLng(),
    farRight = farRight.toRNLatLng(),
    latLngBounds = latLngBounds.toRNLatLngBounds(),
  )
