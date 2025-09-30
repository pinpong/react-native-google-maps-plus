package com.googlemapsnitro

import com.facebook.react.bridge.ReactContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

class PlayServicesHandler(
  val context: ReactContext,
) {
  fun playServicesAvailability(): Int {
    val availability = GoogleApiAvailability.getInstance()
    return availability.isGooglePlayServicesAvailable(context)
  }

  fun isPlayServicesAvailable(): Boolean {
    val availability = playServicesAvailability()
    return when (availability) {
      ConnectionResult.SERVICE_MISSING,
      ConnectionResult.SERVICE_INVALID,
      -> false

      else -> true
    }
  }
}
