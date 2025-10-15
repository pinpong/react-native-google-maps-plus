package com.rngooglemapsplus.extensions

import com.google.android.gms.common.ConnectionResult
import com.rngooglemapsplus.RNMapErrorCode

fun Int.toRNMapErrorCodeOrNull(): RNMapErrorCode? =
  when (this) {
    ConnectionResult.SERVICE_MISSING ->
      RNMapErrorCode.PLAY_SERVICES_MISSING

    ConnectionResult.SERVICE_INVALID ->
      RNMapErrorCode.PLAY_SERVICES_INVALID

    ConnectionResult.SERVICE_VERSION_UPDATE_REQUIRED ->
      RNMapErrorCode.PLAY_SERVICES_OUTDATED

    ConnectionResult.SERVICE_UPDATING ->
      RNMapErrorCode.PLAY_SERVICE_UPDATING

    ConnectionResult.SERVICE_DISABLED ->
      RNMapErrorCode.PLAY_SERVICES_DISABLED

    ConnectionResult.SUCCESS ->
      null

    else ->
      RNMapErrorCode.UNKNOWN
  }
