package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNLatLngBounds

fun LatLngBounds.toRnLatLngBounds(): RNLatLngBounds =
  RNLatLngBounds(
    northeast = northeast.toRnLatLng(),
    southwest = southwest.toRnLatLng(),
  )
