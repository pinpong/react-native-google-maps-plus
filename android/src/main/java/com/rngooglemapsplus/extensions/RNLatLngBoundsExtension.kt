package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNLatLngBounds

fun RNLatLngBounds.toLatLngBounds(): LatLngBounds =
  LatLngBounds(
    southwest.toLatLng(),
    northeast.toLatLng(),
  )
