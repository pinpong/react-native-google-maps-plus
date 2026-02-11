package com.rngooglemapsplus

private const val MAPS_LOG_TAG = "react-native-google-maps-plus"

class MapErrorHandler {
  @Volatile
  var callback: ((RNMapErrorCode, String) -> Unit)? = null

  fun report(
    code: RNMapErrorCode,
    msg: String,
    t: Throwable? = null,
  ) {
    if (t != null) {
      android.util.Log.w(MAPS_LOG_TAG, msg, t)
    } else {
      android.util.Log.w(MAPS_LOG_TAG, msg)
    }

    onUi {
      callback?.invoke(code, msg)
    }
  }
}
