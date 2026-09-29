package com.rngooglemapsplus

import android.Manifest
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.margelo.nitro.core.Promise
import com.rngooglemapsplus.extensions.toRNLocationPermissionResult

private const val REQ_LOCATION = 1001

class PermissionHandler(
  private val context: ReactContext,
) {
  fun getLocationPermission(): RNLocationPermissionResult = context.toRNLocationPermissionResult()

  fun requestLocationPermission(): Promise<RNLocationPermissionResult> {
    val promise = Promise<RNLocationPermissionResult>()

    val perms =
      arrayOf(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
      )

    val current = getLocationPermission()
    if (current.android == RNAndroidLocationPermissionResult.GRANTED) {
      promise.resolve(current)
      return promise
    }

    UiThreadUtil.runOnUiThread {
      val hostActivity = context.currentActivity
      if (hostActivity !is PermissionAwareActivity) {
        promise.resolve(current)
        return@runOnUiThread
      }

      hostActivity.requestPermissions(
        perms,
        REQ_LOCATION,
        object : PermissionListener {
          override fun onRequestPermissionsResult(
            requestCode: Int,
            permissions: Array<String>,
            grantResults: IntArray,
          ): Boolean {
            if (requestCode != REQ_LOCATION) return false

            val result = getLocationPermission()
            val neverAskAgain =
              result.android == RNAndroidLocationPermissionResult.DENIED &&
                context.currentActivity?.shouldShowRequestPermissionRationale(
                  Manifest.permission.ACCESS_COARSE_LOCATION,
                ) == false

            promise.resolve(
              if (neverAskAgain) {
                result.copy(android = RNAndroidLocationPermissionResult.NEVER_ASK_AGAIN)
              } else {
                result
              },
            )

            return true
          }
        },
      )
    }

    return promise
  }
}
