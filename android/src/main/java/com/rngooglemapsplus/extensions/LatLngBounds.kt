package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNRegion

fun LatLngBounds.toRnRegion(): RNRegion {
  val latDelta = northeast.latitude - southwest.latitude
  val lngDelta = northeast.longitude - southwest.longitude

  return RNRegion(
    center = center.toRnLatLng(),
    latitudeDelta = latDelta,
    longitudeDelta = lngDelta,
  )
}
