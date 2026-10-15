package com.rngooglemapsplus.extensions

import android.location.Location
import android.os.Build
import androidx.core.location.LocationCompat
import com.rngooglemapsplus.RNLatLng
import com.rngooglemapsplus.RNLocation
import com.rngooglemapsplus.RNLocationAndroid

fun Location.toRNLocation(): RNLocation =
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
          when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.O -> {
              null
            }

            else -> {
              try {
                if (hasBearingAccuracy()) bearingAccuracyDegrees.toDouble() else null
              } catch (_: IllegalStateException) {
                null
              }
            }
          },
        speedAccuracyMetersPerSecond =
          when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.O -> {
              null
            }

            else -> {
              try {
                if (hasSpeedAccuracy()) speedAccuracyMetersPerSecond.toDouble() else null
              } catch (_: IllegalStateException) {
                null
              }
            }
          },
        verticalAccuracyMeters =
          when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.O -> {
              null
            }

            else -> {
              try {
                if (hasVerticalAccuracy()) verticalAccuracyMeters.toDouble() else null
              } catch (_: IllegalStateException) {
                null
              }
            }
          },
        mslAltitudeMeters =
          when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> {
              null
            }

            else -> {
              try {
                if (hasMslAltitude()) mslAltitudeMeters else null
              } catch (_: IllegalStateException) {
                null
              }
            }
          },
        mslAltitudeAccuracyMeters =
          when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> {
              null
            }

            else -> {
              try {
                if (hasMslAltitude()) mslAltitudeAccuracyMeters.toDouble() else null
              } catch (_: IllegalStateException) {
                null
              }
            }
          },
        isMock = LocationCompat.isMock(this),
      ),
    ios = null,
  )
