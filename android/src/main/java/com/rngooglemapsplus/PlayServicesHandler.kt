package com.rngooglemapsplus

import com.facebook.react.bridge.ReactContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.maps.MapsInitializer
import com.rngooglemapsplus.extensions.toRNMapErrorCodeOrNull

class PlayServicesHandler(
  private val context: ReactContext,
) {
  fun playServicesAvailability(): Int {
    val availability = GoogleApiAvailability.getInstance()
    return availability.isGooglePlayServicesAvailable(context)
  }

  fun isPlayServicesAvailable(): Boolean {
    val availability = playServicesAvailability()
    return availability == ConnectionResult.SUCCESS
  }

  fun initMapsSdk(mapErrorHandler: MapErrorHandler) {
    val errorCode = playServicesAvailability().toRNMapErrorCodeOrNull()
    if (errorCode != null) {
      mapErrorHandler.report(errorCode, "play services unavailable")
      return
    }
    val initErrorCode = MapsInitializer.initialize(context).toRNMapErrorCodeOrNull()
    if (initErrorCode != null) {
      mapErrorHandler.report(initErrorCode, "maps sdk initialization failed")
    }
  }
}
