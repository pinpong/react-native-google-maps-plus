package com.rngooglemapsplus.extensions

import android.content.Context
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.location.LocationSettingsStatusCodes
import com.rngooglemapsplus.RNLocationErrorCode

fun Throwable.toLocationErrorCode(context: Context): RNLocationErrorCode {
  return when (this) {
    is SecurityException -> RNLocationErrorCode.PERMISSION_DENIED

    is ApiException ->
      when (statusCode) {
        CommonStatusCodes.NETWORK_ERROR ->
          RNLocationErrorCode.POSITION_UNAVAILABLE

        LocationSettingsStatusCodes.RESOLUTION_REQUIRED,
        LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE,
        ->
          RNLocationErrorCode.SETTINGS_NOT_SATISFIED

        else ->
          RNLocationErrorCode.INTERNAL_ERROR
      }

    else -> {
      if (message?.contains("GoogleApi", ignoreCase = true) == true) {
        val gms = GoogleApiAvailability.getInstance()
        val status = gms.isGooglePlayServicesAvailable(context)
        if (status != ConnectionResult.SUCCESS) {
          return RNLocationErrorCode.PLAY_SERVICE_NOT_AVAILABLE
        }
      }
      RNLocationErrorCode.INTERNAL_ERROR
    }
  }
}
