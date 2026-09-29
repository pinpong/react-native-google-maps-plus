package com.rngooglemapsplus.extensions

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import com.rngooglemapsplus.RNAndroidLocationPermissionResult
import com.rngooglemapsplus.RNLocationPermissionAccuracy
import com.rngooglemapsplus.RNLocationPermissionResult

fun Context.toRNLocationPermissionResult(): RNLocationPermissionResult {
  val accuracy =
    when {
      hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) -> RNLocationPermissionAccuracy.PRECISE
      hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION) -> RNLocationPermissionAccuracy.APPROXIMATE
      else -> RNLocationPermissionAccuracy.NONE
    }

  return RNLocationPermissionResult(
    accuracy = accuracy,
    locationServicesEnabled =
      LocationManagerCompat.isLocationEnabled(
        getSystemService(Context.LOCATION_SERVICE) as LocationManager,
      ),
    android =
      when (accuracy) {
        RNLocationPermissionAccuracy.NONE -> RNAndroidLocationPermissionResult.DENIED
        else -> RNAndroidLocationPermissionResult.GRANTED
      },
    ios = null,
  )
}

private fun Context.hasPermission(permission: String): Boolean =
  ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
