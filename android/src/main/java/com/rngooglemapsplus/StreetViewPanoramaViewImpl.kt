package com.rngooglemapsplus

import android.content.ComponentCallbacks2
import android.content.res.Configuration
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.findViewTreeLifecycleOwner
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.MapsInitializer
import com.google.android.gms.maps.StreetViewPanorama
import com.google.android.gms.maps.StreetViewPanoramaOptions
import com.google.android.gms.maps.StreetViewPanoramaView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.StreetViewPanoramaCamera
import com.google.android.gms.maps.model.StreetViewPanoramaLocation
import com.google.android.gms.maps.model.StreetViewPanoramaOrientation
import com.google.android.gms.maps.model.StreetViewSource
import com.rngooglemapsplus.extensions.toRNMapErrorCodeOrNull
import com.rngooglemapsplus.extensions.toRnLatLng
import com.rngooglemapsplus.extensions.toRnLocation

class StreetViewPanoramaViewImpl(
  private val reactContext: ThemedReactContext,
  private val locationHandler: LocationHandler,
  private val playServiceHandler: PlayServicesHandler,
  private val mapErrorHandler: MapErrorHandler,
) : GestureAwareFrameLayout(reactContext),
  OnStreetViewPanoramaChangeListenerNullSafe,
  StreetViewPanorama.OnStreetViewPanoramaCameraChangeListener,
  StreetViewPanorama.OnStreetViewPanoramaClickListener,
  ComponentCallbacks2 {
  private var lifecycleObserver: ViewLifecycleEventObserver? = null
  private var lifecycle: Lifecycle? = null

  private var streetViewInitialized = false
  private var destroyed = false

  private var streetViewPanoramaView: StreetViewPanoramaView? = null
  private var streetViewPanorama: StreetViewPanorama? = null

  init {
    MapsInitializer.initialize(reactContext)
    reactContext.registerComponentCallbacks(this)
  }

  fun initStreetView() =
    onUi {
      if (streetViewInitialized) return@onUi
      streetViewInitialized = true

      val result = playServiceHandler.playServicesAvailability()
      val errorCode = result.toRNMapErrorCodeOrNull()
      if (errorCode != null) {
        mapErrorHandler.report(errorCode, "play services unavailable")
        if (errorCode == RNMapErrorCode.PLAY_SERVICES_MISSING ||
          errorCode == RNMapErrorCode.PLAY_SERVICES_INVALID
        ) {
          return@onUi
        }
      }

      streetViewPanoramaView =
        StreetViewPanoramaView(reactContext, streetViewPanoramaOptions).also {
          lifecycleObserver =
            ViewLifecycleEventObserver(
              locationHandler = locationHandler,
              onCreateView = it::onCreate,
              onStartView = it::onStart,
              onResumeView = it::onResume,
              onPauseView = it::onPause,
              onStopView = it::onStop,
              onDestroyView = it::onDestroy,
            )
          super.addView(it)
          it.getStreetViewPanoramaAsync { panorama ->
            if (destroyed) return@getStreetViewPanoramaAsync
            streetViewPanorama = panorama
            streetViewPanorama?.setOnStreetViewPanoramaChangeListener(this@StreetViewPanoramaViewImpl)
            streetViewPanorama?.setOnStreetViewPanoramaCameraChangeListener(this@StreetViewPanoramaViewImpl)
            streetViewPanorama?.setOnStreetViewPanoramaClickListener(this@StreetViewPanoramaViewImpl)
            applyProps()
            initLocationCallbacks()
            onPanoramaReady?.invoke(true)
          }
        }
    }

  override fun onStreetViewPanoramaChangeNullable(location: StreetViewPanoramaLocation?) {
    onUi {
      if (location == null) {
        mapErrorHandler.report(RNMapErrorCode.PANORAMA_NOT_FOUND, "panorama not found")
      } else {
        val links =
          location.links
            .map { link ->
              RNStreetViewPanoramaLink(
                bearing = link.bearing.toDouble(),
                panoramaId = link.panoId,
              )
            }.toTypedArray()
        onPanoramaChange?.invoke(
          RNStreetViewPanoramaLocation(
            position = location.position.toRnLatLng(),
            panoramaId = location.panoId,
            links = links,
          ),
        )
      }
    }
  }

  override fun onStreetViewPanoramaCameraChange(camera: StreetViewPanoramaCamera) {
    onUi {
      onCameraChange?.invoke(
        RNStreetViewCamera(
          bearing = camera.bearing.toDouble(),
          tilt = camera.tilt.toDouble(),
          zoom = camera.zoom.toDouble(),
        ),
      )
    }
  }

  override fun onStreetViewPanoramaClick(orientation: StreetViewPanoramaOrientation) {
    onUi {
      onPanoramaPress?.invoke(
        RNStreetViewOrientation(
          bearing = orientation.bearing.toDouble(),
          tilt = orientation.tilt.toDouble(),
        ),
      )
    }
  }

  fun initLocationCallbacks() {
    locationHandler.onUpdate = { location ->
      onUi { onLocationUpdate?.invoke(location.toRnLocation()) }
    }
    locationHandler.onError = { error ->
      onUi { onLocationError?.invoke(error) }
    }
  }

  fun applyProps() {
    uiSettings = uiSettings
  }

  val currentCamera: StreetViewPanoramaCamera?
    get() = onUiSync { streetViewPanorama?.panoramaCamera }

  var streetViewPanoramaOptions: StreetViewPanoramaOptions = StreetViewPanoramaOptions()

  var uiSettings: RNStreetViewUiSettings? = null
    set(value) {
      field = value
      onUi {
        streetViewPanorama?.apply {
          isStreetNamesEnabled = value?.streetNamesEnabled ?: true
          isUserNavigationEnabled = value?.userNavigationEnabled ?: true
          isPanningGesturesEnabled = value?.panningGesturesEnabled ?: true
          isZoomGesturesEnabled = value?.zoomGesturesEnabled ?: true
        }
      }
    }

  var onPanoramaReady: ((Boolean) -> Unit)? = null
  var onLocationUpdate: ((RNLocation) -> Unit)? = null
  var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
  var onPanoramaChange: ((RNStreetViewPanoramaLocation) -> Unit)? = null
  var onCameraChange: ((RNStreetViewCamera) -> Unit)? = null
  var onPanoramaPress: ((RNStreetViewOrientation) -> Unit)? = null

  fun setPosition(
    latLng: LatLng,
    radius: Int?,
    source: StreetViewSource,
  ) = onUi {
    radius?.let { streetViewPanorama?.setPosition(latLng, it, source) }
      ?: streetViewPanorama?.setPosition(latLng, source)
  }

  fun setPositionById(panoramaId: String) =
    onUi {
      streetViewPanorama?.setPosition(panoramaId)
    }

  fun setPanoramaCamera(
    camera: StreetViewPanoramaCamera,
    animated: Boolean,
    durationMs: Int,
  ) = onUi {
    if (animated) {
      streetViewPanorama?.animateTo(camera, durationMs.toLong())
    } else {
      streetViewPanorama?.animateTo(camera, 0)
    }
  }

  fun destroyInternal() =
    onUi {
      if (destroyed) return@onUi
      destroyed = true
      lifecycleObserver?.toDestroyedState()
      lifecycleObserver = null
      streetViewPanorama?.apply {
        setOnStreetViewPanoramaChangeListener(null)
        setOnStreetViewPanoramaCameraChangeListener(null)
        setOnStreetViewPanoramaClickListener(null)
      }
      streetViewPanorama = null
      streetViewPanoramaView?.removeAllViews()
      streetViewPanoramaView = null
      super.removeAllViews()
      reactContext.unregisterComponentCallbacks(this)
    }

  override fun requestLayout() {
    super.requestLayout()
    post {
      measure(
        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
      )
      layout(left, top, right, bottom)
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    initStreetView()
    lifecycle = streetViewPanoramaView?.findViewTreeLifecycleOwner()?.lifecycle
    lifecycleObserver?.let { observer ->
      lifecycle?.addObserver(observer)
    }
  }

  override fun onDetachedFromWindow() {
    setParentTouchInterceptDisallowed(false)
    lifecycleObserver?.let { lifecycle?.removeObserver(it) }
    lifecycle = null
    super.onDetachedFromWindow()
  }

  override val panGestureEnabled get() = uiSettings?.panningGesturesEnabled == true
  override val multiTouchGestureEnabled get() = uiSettings?.zoomGesturesEnabled == true

  override fun onConfigurationChanged(newConfig: Configuration) {}

  override fun onLowMemory() {
    streetViewPanoramaView?.onLowMemory()
  }

  override fun onTrimMemory(level: Int) {
    streetViewPanoramaView?.onLowMemory()
  }
}
