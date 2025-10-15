package com.rngooglemapsplus.extensions

import android.location.Location
import android.os.Build
import com.rngooglemapsplus.RNLatLng
import com.rngooglemapsplus.RNLocation
import com.rngooglemapsplus.RNLocationAndroid

fun Location.toRnLocation(): RNLocation =
  RNLocation(
    center = RNLatLng(latitude, longitude),
    altitude = altitude,
    accuracy = accuracy.toDouble(),
    bearing = bearing.toDouble(),
    speed = speed.toDouble(),
    time = time.toDouble(),
    android =
      RNLocationAndroid(
        provider = provider,
        elapsedRealtimeNanos = elapsedRealtimeNanos.toDouble(),
        bearingAccuracyDegrees =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            bearingAccuracyDegrees.toDouble()
          } else {
            null
          },
        speedAccuracyMetersPerSecond =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            speedAccuracyMetersPerSecond.toDouble()
          } else {
            null
          },
        verticalAccuracyMeters =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            verticalAccuracyMeters.toDouble()
          } else {
            null
          },
        mslAltitudeMeters =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            mslAltitudeMeters
          } else {
            null
          },
        mslAltitudeAccuracyMeters =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            mslAltitudeAccuracyMeters.toDouble()
          } else {
            null
          },
        isMock =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            isMock
          } else {
            isFromMockProvider
          },
      ),
    ios = null,
  )
