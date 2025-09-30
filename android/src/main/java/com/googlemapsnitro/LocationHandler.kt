package com.googlemapsnitro

import android.annotation.SuppressLint
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.Looper
import android.provider.Settings
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.LocationSettingsStatusCodes
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.OnSuccessListener

private const val REQ_LOCATION_SETTINGS = 2001

class LocationHandler(
  val context: ReactContext,
) {
  private val fusedLocationClientProviderClient: FusedLocationProviderClient =
    LocationServices.getFusedLocationProviderClient(context)
  private var locationRequest: LocationRequest? = null
  private var locationCallback: LocationCallback? = null
  private var priority = Priority.PRIORITY_HIGH_ACCURACY
  private var interval: Long = 5000
  private var minUpdateInterval: Long = 5000
  var onUpdate: ((Location) -> Unit)? = null
  var onError: ((RNLocationErrorCode) -> Unit)? = null

  init {
    buildLocationRequest()
  }

  fun showLocationDialog() {
    UiThreadUtil.runOnUiThread {
      val activity = context.currentActivity ?: run { return@runOnUiThread }

      val lr =
        if (Build.VERSION.SDK_INT >= 31) {
          LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10_000L).build()
        } else {
          @Suppress("DEPRECATION")
          LocationRequest.create().apply { priority = Priority.PRIORITY_HIGH_ACCURACY }
        }

      val req =
        LocationSettingsRequest
          .Builder()
          .addLocationRequest(lr)
          .setAlwaysShow(true)
          .build()

      val settingsClient = LocationServices.getSettingsClient(activity)
      settingsClient
        .checkLocationSettings(req)
        .addOnSuccessListener {
        }.addOnFailureListener { ex ->
          if (ex is ResolvableApiException) {
            try {
              ex.startResolutionForResult(activity, REQ_LOCATION_SETTINGS)
            } catch (_: Exception) {
              onError?.invoke(RNLocationErrorCode.SETTINGS_NOT_SATISFIED)
            }
          } else {
            onError?.invoke(RNLocationErrorCode.SETTINGS_NOT_SATISFIED)
            openLocationSettings()
          }
        }
    }
  }

  fun openLocationSettings() {
    UiThreadUtil.runOnUiThread {
      val intent =
        Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.currentActivity?.startActivity(intent)
    }
  }

  @Suppress("deprecation")
  private fun buildLocationRequest() {
    locationRequest =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        LocationRequest
          .Builder(priority, interval)
          .setMinUpdateIntervalMillis(minUpdateInterval)
          .build()
      } else {
        LocationRequest
          .create()
          .setPriority(priority)
          .setInterval(interval)
          .setFastestInterval(minUpdateInterval)
      }
    restartLocationUpdates()
  }

  fun setPriority(priority: Int) {
    this.priority = priority
    buildLocationRequest()
  }

  fun setInterval(interval: Int) {
    this.interval = interval.toLong()
    buildLocationRequest()
  }

  fun setFastestInterval(fastestInterval: Int) {
    this.minUpdateInterval = fastestInterval.toLong()
    buildLocationRequest()
  }

  private fun restartLocationUpdates() {
    stop()
    // 4) Google Play Services checken – früh zurückmelden
    val playServicesStatus =
      GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(context)
    if (playServicesStatus != ConnectionResult.SUCCESS) {
      onError?.invoke(RNLocationErrorCode.PLAY_SERVICE_NOT_AVAILABLE)
      return
    }
    start()
  }

  @SuppressLint("MissingPermission")
  fun start() {
    try {
      fusedLocationClientProviderClient.lastLocation
        .addOnSuccessListener(
          OnSuccessListener { location ->
            if (location != null) {
              onUpdate?.invoke(location)
            }
          },
        ).addOnFailureListener { e ->
          val error = mapThrowableToCode(e)
          onError?.invoke(error)
        }
      locationCallback =
        object : LocationCallback() {
          override fun onLocationResult(locationResult: LocationResult) {
            val location = locationResult.lastLocation
            if (location != null) {
              onUpdate?.invoke(location)
            } else {
              onError?.invoke(RNLocationErrorCode.POSITION_UNAVAILABLE)
            }
          }
        }
      fusedLocationClientProviderClient
        .requestLocationUpdates(
          locationRequest!!,
          locationCallback!!,
          Looper.getMainLooper(),
        ).addOnFailureListener { e ->
          val error = mapThrowableToCode(e)
          onError?.invoke(error)
        }
    } catch (se: SecurityException) {
      onError?.invoke(RNLocationErrorCode.PERMISSION_DENIED)
    } catch (ex: Exception) {
      val error = mapThrowableToCode(ex)
      onError?.invoke(error)
    }
  }

  private fun mapThrowableToCode(t: Throwable): RNLocationErrorCode {
    if (t is SecurityException) return RNLocationErrorCode.PERMISSION_DENIED
    if (t.message?.contains("GoogleApi", ignoreCase = true) == true) {
      val gms = GoogleApiAvailability.getInstance()
      val status = gms.isGooglePlayServicesAvailable(context)
      if (status != ConnectionResult.SUCCESS) return RNLocationErrorCode.PLAY_SERVICE_NOT_AVAILABLE
    }
    if (t is ApiException) {
      when (t.statusCode) {
        CommonStatusCodes.NETWORK_ERROR -> return RNLocationErrorCode.POSITION_UNAVAILABLE
        LocationSettingsStatusCodes.RESOLUTION_REQUIRED,
        LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE,
        -> return RNLocationErrorCode.SETTINGS_NOT_SATISFIED
      }
      return RNLocationErrorCode.INTERNAL_ERROR
    }
    return RNLocationErrorCode.INTERNAL_ERROR
  }

  fun stop() {
    if (locationCallback != null) {
      fusedLocationClientProviderClient.removeLocationUpdates(locationCallback!!)
      locationCallback = null
    }
  }
}
