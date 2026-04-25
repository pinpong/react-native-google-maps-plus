package com.rngooglemapsplus

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.StreetViewPanoramaOptions
import com.margelo.nitro.core.Promise
import com.rngooglemapsplus.extensions.toLatLng
import com.rngooglemapsplus.extensions.toStreetViewPanoramaCamera
import com.rngooglemapsplus.extensions.toStreetViewSource

@DoNotStrip
class RNGoogleMapsPlusStreetView(
  private val context: ThemedReactContext,
) : HybridRNGoogleMapsPlusStreetViewSpec() {
  private val mapErrorHandler = MapErrorHandler()
  private val permissionHandler = PermissionHandler(context)
  private val locationHandler = LocationHandler(context)
  private val playServiceHandler = PlayServicesHandler(context)

  override val view =
    StreetViewPanoramaViewImpl(
      context,
      locationHandler,
      playServiceHandler,
      mapErrorHandler,
    )

  override fun onDropView() {
    view.destroyInternal()
  }

  override var initialProps: RNStreetViewInitialProps? = null
    set(value) {
      if (field == value) return
      field = value

      val options =
        StreetViewPanoramaOptions().apply {
          panoramaId(initialProps?.panoramaId)
          initialProps?.position?.let {
            position(
              it.toLatLng(),
              initialProps?.radius?.toInt(),
              initialProps?.source.toStreetViewSource(),
            )
          }
          initialProps?.camera?.toStreetViewPanoramaCamera()?.let { panoramaCamera(it) }
        }

      view.streetViewPanoramaOptions = options
    }

  override var uiSettings: RNStreetViewUiSettings? = null
    set(value) {
      if (field == value) return
      field = value
      view.uiSettings = value
    }

  override var onPanoramaReady: ((Boolean) -> Unit)? = null
    set(cb) {
      view.onPanoramaReady = cb
    }

  override var onLocationUpdate: ((RNLocation) -> Unit)? = null
    set(cb) {
      view.onLocationUpdate = cb
    }

  override var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
    set(cb) {
      view.onLocationError = cb
    }

  override var onPanoramaChange: ((RNStreetViewPanoramaLocation) -> Unit)? = null
    set(cb) {
      view.onPanoramaChange = cb
    }

  override var onCameraChange: ((RNStreetViewCamera) -> Unit)? = null
    set(cb) {
      view.onCameraChange = cb
    }

  override var onPanoramaPress: ((RNStreetViewOrientation) -> Unit)? = null
    set(cb) {
      view.onPanoramaPress = cb
    }

  override var onPanoramaError: ((RNMapErrorCode, String) -> Unit)? = null
    set(cb) {
      mapErrorHandler.callback = cb
    }

  override fun setCamera(
    camera: RNStreetViewCamera,
    animated: Boolean?,
    durationMs: Double?,
  ) {
    val current = view.currentCamera
    view.setPanoramaCamera(
      camera.toStreetViewPanoramaCamera(current),
      animated ?: false,
      durationMs?.toInt() ?: 3000,
    )
  }

  override fun setPosition(
    position: RNLatLng,
    radius: Double?,
    source: RNStreetViewSource?,
  ) {
    view.setPosition(
      position.toLatLng(),
      radius?.toInt(),
      source.toStreetViewSource(),
    )
  }

  override fun setPositionById(panoramaId: String) {
    view.setPositionById(panoramaId)
  }

  override fun showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  override fun openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  override fun requestLocationPermission(): Promise<RNLocationPermissionResult> = permissionHandler.requestLocationPermission()

  override fun isGooglePlayServicesAvailable(): Boolean = playServiceHandler.isPlayServicesAvailable()
}
