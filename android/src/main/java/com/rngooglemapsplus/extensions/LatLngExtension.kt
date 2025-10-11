package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLng
import com.rngooglemapsplus.RNLatLng

fun LatLng.toRnLatLng(): RNLatLng = RNLatLng(latitude, longitude)
