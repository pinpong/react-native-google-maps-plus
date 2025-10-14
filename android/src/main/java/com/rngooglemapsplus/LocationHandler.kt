package com.rngooglemapsplus

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
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.LocationSource
import com.google.android.gms.tasks.OnSuccessListener
import com.rngooglemapsplus.extensions.toLocationErrorCode

private const val REQ_LOCATION_SETTINGS = 2001
private const val PRIORITY_DEFAULT = Priority.PRIORITY_BALANCED_POWER_ACCURACY
private const val INTERVAL_DEFAULT = 600000L
private const val MIN_UPDATE_INTERVAL = 3600000L

class LocationHandler(
  val context: ReactContext,
) : LocationSource {
  private val fusedLocationClientProviderClient: FusedLocationProviderClient =
    LocationServices.getFusedLocationProviderClient(context)
  private var listener: LocationSource.OnLocationChangedListener? = null
  private var locationRequest: LocationRequest? = null
  private var locationCallback: LocationCallback? = null
  private var priority: Int = PRIORITY_DEFAULT
  private var interval: Long = INTERVAL_DEFAULT
  private var minUpdateInterval: Long = MIN_UPDATE_INTERVAL
  private var lastSubmittedLocation: Location? = null
  private var isActive = false

  var onUpdate: ((Location) -> Unit)? = null
  var onError: ((RNLocationErrorCode) -> Unit)? = null

  init {
    buildLocationRequest(priority, interval, minUpdateInterval)
  }

  fun updateConfig(
    priority: Int? = null,
    interval: Long? = null,
    minUpdateInterval: Long? = null,
  ) {
    this.priority = priority ?: PRIORITY_DEFAULT
    this.interval = interval ?: INTERVAL_DEFAULT
    this.minUpdateInterval = minUpdateInterval ?: MIN_UPDATE_INTERVAL
    buildLocationRequest(this.priority, this.interval, this.minUpdateInterval)
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
  private fun buildLocationRequest(
    priority: Int,
    interval: Long,
    minUpdateInterval: Long,
  ) {
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
  }

  @SuppressLint("MissingPermission")
  fun start() {
    if (isActive) return
    isActive = true

    val playServicesStatus =
      GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(context)
    if (playServicesStatus != ConnectionResult.SUCCESS) {
      onError?.invoke(RNLocationErrorCode.PLAY_SERVICE_NOT_AVAILABLE)
      return
    }
    try {
      fusedLocationClientProviderClient.lastLocation
        .addOnSuccessListener(
          OnSuccessListener { location ->
            if (location != null && location != lastSubmittedLocation) {
              onUpdate?.invoke(location)
              lastSubmittedLocation = location
            }
          },
        ).addOnFailureListener { e ->
          val error = e.toLocationErrorCode(context)
          onError?.invoke(error)
        }
      locationCallback =
        object : LocationCallback() {
          override fun onLocationResult(locationResult: LocationResult) {
            val location = locationResult.lastLocation
            if (location != null) {
              if (location != lastSubmittedLocation) {
                lastSubmittedLocation = location
                listener?.onLocationChanged(location)
                onUpdate?.invoke(location)
              }
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
          val error = e.toLocationErrorCode(context)
          onError?.invoke(error)
        }
    } catch (se: SecurityException) {
      onError?.invoke(RNLocationErrorCode.PERMISSION_DENIED)
    } catch (ex: Exception) {
      val error = ex.toLocationErrorCode(context)
      onError?.invoke(error)
    }
  }

  fun stop() {
    if (!isActive) return
    isActive = false
    if (locationCallback != null) {
      fusedLocationClientProviderClient.removeLocationUpdates(locationCallback!!)
      fusedLocationClientProviderClient.flushLocations()
      locationCallback = null
    }
  }

  override fun activate(listener: LocationSource.OnLocationChangedListener) {
    this.listener = listener
    start()
  }

  override fun deactivate() {
    listener = null
    stop()
  }
}
