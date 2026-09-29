package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.MapCapabilities
import com.rngooglemapsplus.RNMapCapabilities

// legacy renderer: getMapCapabilities() throws
fun GoogleMap.toRNMapCapabilities(): RNMapCapabilities =
  try {
    mapCapabilities.toRNMapCapabilities()
  } catch (_: NullPointerException) {
    RNMapCapabilities(false, false)
  }

fun MapCapabilities.toRNMapCapabilities(): RNMapCapabilities =
  RNMapCapabilities(
    advancedMarkersAvailable = isAdvancedMarkersAvailable,
    dataDrivenStylingAvailable = isDataDrivenStylingAvailable,
  )
