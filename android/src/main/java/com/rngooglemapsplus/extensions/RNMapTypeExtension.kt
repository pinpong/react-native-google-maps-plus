package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.GoogleMap
import com.rngooglemapsplus.RNMapType

fun RNMapType.toGoogleMapType(): Int =
  when (this) {
    RNMapType.NONE -> GoogleMap.MAP_TYPE_NONE
    RNMapType.NORMAL -> GoogleMap.MAP_TYPE_NORMAL
    RNMapType.HYBRID -> GoogleMap.MAP_TYPE_HYBRID
    RNMapType.SATELLITE -> GoogleMap.MAP_TYPE_SATELLITE
    RNMapType.TERRAIN -> GoogleMap.MAP_TYPE_TERRAIN
  }
