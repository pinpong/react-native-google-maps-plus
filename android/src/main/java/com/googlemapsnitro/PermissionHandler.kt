package com.googlemapsnitro

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.margelo.nitro.core.Promise

private const val REQ_LOCATION = 1001

class PermissionHandler(
  private val context: ReactContext,
) {
  fun requestLocationPermission(): Promise<RNLocationPermissionResult> {
    val promise = Promise<RNLocationPermissionResult>()

    val perms =
      arrayOf(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
      )

    val alreadyGranted =
      ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.ACCESS_COARSE_LOCATION,
      ) == PackageManager.PERMISSION_GRANTED
    if (alreadyGranted) {
      promise.resolve(RNLocationPermissionResult(RNAndroidLocationPermissionResult.GRANTED, null))
      return promise
    }

    UiThreadUtil.runOnUiThread {
      val hostActivity = context.currentActivity
      if (hostActivity !is PermissionAwareActivity) {
        promise.resolve(RNLocationPermissionResult(RNAndroidLocationPermissionResult.DENIED, null))
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

            var coarseGranted = false
            var fineGranted = false

            for (i in permissions.indices) {
              val p = permissions[i]
              val r = grantResults.getOrNull(i) ?: continue
              if (p == Manifest.permission.ACCESS_COARSE_LOCATION && r == PackageManager.PERMISSION_GRANTED) {
                coarseGranted = true
              }
              if (p == Manifest.permission.ACCESS_FINE_LOCATION && r == PackageManager.PERMISSION_GRANTED) {
                fineGranted = true
              }
            }

            val hostActivity =
              context.currentActivity ?: run {
                promise.resolve(
                  RNLocationPermissionResult(
                    RNAndroidLocationPermissionResult.DENIED,
                    null,
                  ),
                )
                return true
              }

            val granted = coarseGranted || fineGranted
            if (granted) {
              promise.resolve(
                RNLocationPermissionResult(
                  RNAndroidLocationPermissionResult.GRANTED,
                  null,
                ),
              )
            } else {
              val neverAskAgain =
                !hostActivity.shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_COARSE_LOCATION)

              if (neverAskAgain) {
                promise.resolve(
                  RNLocationPermissionResult(
                    RNAndroidLocationPermissionResult.NEVER_ASK_AGAIN,
                    null,
                  ),
                )
              } else {
                promise.resolve(
                  RNLocationPermissionResult(
                    RNAndroidLocationPermissionResult.DENIED,
                    null,
                  ),
                )
              }
            }

            return true
          }
        },
      )
    }

    return promise
  }
}
