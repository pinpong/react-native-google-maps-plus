package com.rngooglemapsplus

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Looper
import android.provider.Settings
import androidx.core.location.LocationListenerCompat
import androidx.core.location.LocationManagerCompat
import androidx.core.location.LocationRequestCompat
import com.facebook.react.bridge.ReactContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationAvailability
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.LocationSource
import com.rngooglemapsplus.extensions.toLocationErrorCode
import com.rngooglemapsplus.extensions.toRNLocationPermissionResult

private const val REQ_LOCATION_SETTINGS = 2001
private const val PRIORITY_DEFAULT = Priority.PRIORITY_BALANCED_POWER_ACCURACY
private const val INTERVAL_DEFAULT = 600000L
private const val MIN_UPDATE_INTERVAL = 3600000L
private const val MIN_UPDATE_DISTANCE_METERS = 0f

class LocationHandler(
  private val context: ReactContext,
) : LocationSource {
  private val fusedLocationClientProviderClient: FusedLocationProviderClient =
    LocationServices.getFusedLocationProviderClient(context)
  private val locationManager: LocationManager =
    context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
  private var listener: LocationSource.OnLocationChangedListener? = null
  private var locationRequest: LocationRequest? = null
  private var locationCallback: LocationCallback? = null
  private var lastLocation: Location? = null
  private var locationProviderListener: LocationListenerCompat? = null
  private var lastReportedError: RNLocationErrorCode? = null
  private var isActive = false
  private var isStarted = false
  private var isEnabled = false

  private var priority: Int = PRIORITY_DEFAULT
  private var interval: Long = INTERVAL_DEFAULT
  private var minUpdateInterval: Long = MIN_UPDATE_INTERVAL
  private var minUpdateDistanceMeters: Float = MIN_UPDATE_DISTANCE_METERS

  var onUpdate: ((Location) -> Unit)? = null
  var onError: ((RNLocationErrorCode) -> Unit)? = null
  var onStatusChange: ((RNLocationPermissionResult) -> Unit)? = null

  init {
    buildLocationRequest(priority, interval, minUpdateInterval, minUpdateDistanceMeters)
  }

  fun updateConfig(
    enabled: Boolean? = null,
    priority: Int? = null,
    interval: Long? = null,
    minUpdateInterval: Long? = null,
    minUpdateDistanceMeters: Float? = null,
  ) {
    val wasEnabled = isEnabled
    val previousRequest = locationRequest
    isEnabled = enabled ?: false
    this.priority = priority ?: PRIORITY_DEFAULT
    this.interval = interval ?: INTERVAL_DEFAULT
    this.minUpdateInterval = minUpdateInterval ?: MIN_UPDATE_INTERVAL
    this.minUpdateDistanceMeters = minUpdateDistanceMeters ?: MIN_UPDATE_DISTANCE_METERS
    buildLocationRequest(
      this.priority,
      this.interval,
      this.minUpdateInterval,
      this.minUpdateDistanceMeters,
    )

    if (!isStarted) return
    if (isEnabled == wasEnabled && locationRequest == previousRequest) return
    stopUpdates()
    startUpdates()
  }

  fun showLocationDialog() {
    onUi {
      val activity = context.currentActivity ?: return@onUi

      val lr =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
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

  fun openLocationSettings() =
    onUi {
      val intent =
        Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.currentActivity?.startActivity(intent)
    }

  @Suppress("deprecation")
  private fun buildLocationRequest(
    priority: Int,
    interval: Long,
    minUpdateInterval: Long,
    minUpdateDistanceMeters: Float,
  ) {
    locationRequest =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        LocationRequest
          .Builder(priority, interval)
          .setMinUpdateIntervalMillis(minUpdateInterval)
          .setMinUpdateDistanceMeters(minUpdateDistanceMeters)
          .build()
      } else {
        LocationRequest
          .create()
          .setPriority(priority)
          .setInterval(interval)
          .setFastestInterval(minUpdateInterval)
          .setSmallestDisplacement(minUpdateDistanceMeters)
      }
  }

  private fun isNewerLocation(location: Location): Boolean {
    val prev = lastLocation ?: return true
    return location.elapsedRealtimeNanos > prev.elapsedRealtimeNanos
  }

  private fun notifyListener(location: Location) {
    lastLocation = location
    listener?.onLocationChanged(location)
    onUpdate?.invoke(location)
  }

  @SuppressLint("MissingPermission")
  private fun registerLocationProviderListener(callback: LocationCallback) {
    if (locationProviderListener != null) return
    val listener =
      object : LocationListenerCompat {
        override fun onLocationChanged(location: Location) = Unit

        override fun onProviderEnabled(provider: String) = providerChanged(callback)

        override fun onProviderDisabled(provider: String) = providerChanged(callback)
      }

    // The passive provider only reports when location is switched on or off.
    LocationManagerCompat.requestLocationUpdates(
      locationManager,
      LocationManager.PASSIVE_PROVIDER,
      LocationRequestCompat
        .Builder(LocationRequestCompat.PASSIVE_INTERVAL)
        .setMinUpdateIntervalMillis(LocationRequestCompat.PASSIVE_INTERVAL)
        .build(),
      listener,
      Looper.getMainLooper(),
    )
    locationProviderListener = listener
  }

  @SuppressLint("MissingPermission")
  private fun unregisterLocationProviderListener() {
    val listener = locationProviderListener ?: return
    locationProviderListener = null
    LocationManagerCompat.removeUpdates(locationManager, listener)
  }

  private fun providerChanged(callback: LocationCallback) {
    reportStatus()
    checkLocationSettings(callback)
  }

  private fun reportStatus() {
    onStatusChange?.invoke(context.toRNLocationPermissionResult())
  }

  private fun checkLocationSettings(callback: LocationCallback) {
    if (!isActive || callback !== locationCallback) return

    if (!LocationManagerCompat.isLocationEnabled(locationManager)) {
      reportError(RNLocationErrorCode.SETTINGS_NOT_SATISFIED)
      return
    }
    val request = locationRequest ?: return

    val settingsRequest =
      LocationSettingsRequest
        .Builder()
        .addLocationRequest(request)
        .build()

    LocationServices
      .getSettingsClient(context)
      .checkLocationSettings(settingsRequest)
      .addOnCompleteListener { task ->
        if (!isActive || callback !== locationCallback) return@addOnCompleteListener
        if (task.isSuccessful) {
          lastReportedError = null
          return@addOnCompleteListener
        }
        val ex = task.exception ?: return@addOnCompleteListener
        reportError(ex.toLocationErrorCode(context))
      }
  }

  // Several sources report the same state, e.g. provider change and availability.
  private fun reportError(code: RNLocationErrorCode) {
    if (lastReportedError == code) return
    lastReportedError = code
    onError?.invoke(code)
  }

  fun start() {
    isStarted = true
    startUpdates()
  }

  fun stop() {
    isStarted = false
    stopUpdates()
  }

  @SuppressLint("MissingPermission")
  private fun startUpdates() {
    if (isActive || !isEnabled) return
    lastReportedError = null
    reportStatus()

    val playServicesStatus =
      GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(context)
    if (playServicesStatus != ConnectionResult.SUCCESS) {
      reportError(RNLocationErrorCode.PLAY_SERVICE_NOT_AVAILABLE)
      return
    }

    try {
      fusedLocationClientProviderClient
        .getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
        .addOnSuccessListener { location ->
          if (location == null) return@addOnSuccessListener
          if (!isNewerLocation(location)) return@addOnSuccessListener
          notifyListener(location)
        }.addOnFailureListener { e ->
          reportError(e.toLocationErrorCode(context))
        }
      locationCallback =
        object : LocationCallback() {
          override fun onLocationResult(locationResult: LocationResult) {
            // An empty result is not an error, the provider keeps trying.
            val location = locationResult.lastLocation ?: return
            if (!isNewerLocation(location)) return
            notifyListener(location)
          }

          override fun onLocationAvailability(availability: LocationAvailability) {
            if (availability.isLocationAvailable) return
            checkLocationSettings(this)
          }
        }

      val req = locationRequest ?: return
      val callback = locationCallback ?: return

      fusedLocationClientProviderClient
        .requestLocationUpdates(req, callback, Looper.getMainLooper())
        .addOnFailureListener { e ->
          reportError(e.toLocationErrorCode(context))
        }
      isActive = true
      registerLocationProviderListener(callback)
      checkLocationSettings(callback)
    } catch (_: SecurityException) {
      reportError(RNLocationErrorCode.PERMISSION_DENIED)
    } catch (ex: Exception) {
      reportError(ex.toLocationErrorCode(context))
    }
  }

  private fun stopUpdates() {
    if (!isActive) return
    isActive = false
    unregisterLocationProviderListener()
    val callback = locationCallback ?: return
    fusedLocationClientProviderClient.removeLocationUpdates(callback)
    fusedLocationClientProviderClient.flushLocations()
    locationCallback = null
  }

  override fun activate(listener: LocationSource.OnLocationChangedListener) {
    this.listener = listener
    lastLocation?.let {
      listener.onLocationChanged(it)
    }
  }

  override fun deactivate() {
    listener = null
  }
}
