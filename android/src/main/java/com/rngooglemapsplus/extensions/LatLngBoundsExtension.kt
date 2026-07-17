package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNLatLngBounds

fun LatLngBounds.toRNLatLngBounds(): RNLatLngBounds =
  RNLatLngBounds(
    northeast = northeast.toRNLatLng(),
    southwest = southwest.toRNLatLng(),
  )
