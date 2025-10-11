package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNLatLngBounds

fun RNLatLngBounds.toLatLngBounds(): LatLngBounds =
  LatLngBounds(
    LatLng(
      southWest.latitude,
      southWest.longitude,
    ),
    LatLng(
      northEast.latitude,
      northEast.longitude,
    ),
  )
