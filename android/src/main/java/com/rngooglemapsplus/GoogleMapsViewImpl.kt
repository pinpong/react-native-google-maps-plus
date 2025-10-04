package com.rngooglemapsplus

import android.annotation.SuppressLint
import android.location.Location
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MapColorScheme
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.PolygonOptions
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions

class GoogleMapsViewImpl(
  val reactContext: ThemedReactContext,
  val locationHandler: LocationHandler,
  val playServiceHandler: PlayServicesHandler,
  val markerOptions: com.rngooglemapsplus.MarkerOptions,
) : MapView(reactContext),
  GoogleMap.OnCameraMoveStartedListener,
  GoogleMap.OnCameraMoveListener,
  GoogleMap.OnCameraIdleListener,
  GoogleMap.OnMapClickListener,
  OnMapReadyCallback,
  GoogleMap.OnMarkerClickListener,
  LifecycleEventListener {
  private var googleMap: GoogleMap? = null

  private var pendingBuildingEnabled: Boolean? = null
  private var pendingTrafficEnabled: Boolean? = null
  private var pendingCustomMapStyle: MapStyleOptions? = null
  private var pendingInitialCamera: CameraPosition? = null
  private var pendingUserInterfaceStyle: Int? = null
  private var pendingMinZoomLevel: Double? = null
  private var pendingMaxZoomLevel: Double? = null
  private var pendingMapPadding: RNMapPadding? = null
  private var pendingMapType: Int? = null
  private val pendingPolygons = mutableListOf<Pair<String, PolygonOptions>>()
  private val pendingPolylines = mutableListOf<Pair<String, PolylineOptions>>()
  private val pendingMarkers = mutableListOf<Pair<String, MarkerOptions>>()
  private var cameraMoveReason = -1

  private val polygonsById = mutableMapOf<String, Polygon>()
  private val polylinesById = mutableMapOf<String, Polyline>()
  private val markersById = mutableMapOf<String, Marker>()

  private var lastSubmittedLocation: Location? = null
  private var lastSubmittedCameraPosition: CameraPosition? = null

  init {
    reactContext.addLifecycleEventListener(this)
    getMap()
  }

  private fun getMap() {
    val result = playServiceHandler.playServicesAvailability()

    when (result) {
      ConnectionResult.SERVICE_MISSING -> {
        onMapError?.invoke(RNMapErrorCode.PLAY_SERVICES_MISSING)
        return
      }

      ConnectionResult.SERVICE_INVALID -> {
        onMapError?.invoke(RNMapErrorCode.PLAY_SERVICES_INVALID)
        return
      }

      ConnectionResult.SERVICE_VERSION_UPDATE_REQUIRED ->
        onMapError?.invoke(RNMapErrorCode.PLAY_SERVICES_OUTDATED)

      ConnectionResult.SERVICE_UPDATING ->
        onMapError?.invoke(RNMapErrorCode.PLAY_SERVICE_UPDATING)

      ConnectionResult.SERVICE_DISABLED ->
        onMapError?.invoke(RNMapErrorCode.PLAY_SERVICES_DISABLED)

      ConnectionResult.SUCCESS -> {}

      else ->
        onMapError?.invoke(RNMapErrorCode.UNKNOWN)
    }

    onCreate(null)
    getMapAsync(this@GoogleMapsViewImpl)
  }

  override fun onCameraMoveStarted(reason: Int) {
    lastSubmittedCameraPosition = null
    cameraMoveReason = reason
    val bounds = googleMap?.projection?.visibleRegion?.latLngBounds
    val cameraPosition = googleMap?.cameraPosition
    if (bounds == null || cameraPosition == null) {
      return
    }
    val isGesture = GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == reason

    val latDelta = bounds.northeast.latitude - bounds.southwest.latitude
    val lngDelta = bounds.northeast.longitude - bounds.southwest.longitude

    onCameraChangeStart?.invoke(
      RNRegion(
        center = RNLatLng(bounds.center.latitude, bounds.center.longitude),
        latitudeDelta = latDelta,
        longitudeDelta = lngDelta,
      ),
      RNCamera(
        center = RNLatLng(cameraPosition.target.latitude, cameraPosition.target.longitude),
        zoom = cameraPosition.zoom.toDouble(),
        bearing = cameraPosition.bearing.toDouble(),
        tilt = cameraPosition.tilt.toDouble(),
      ),
      isGesture,
    )
  }

  override fun onCameraMove() {
    val bounds = googleMap?.projection?.visibleRegion?.latLngBounds
    val cameraPosition = googleMap?.cameraPosition
    if (bounds == null || cameraPosition == null) {
      return
    }
    if (cameraPosition == lastSubmittedCameraPosition) {
      return
    }
    val isGesture = GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == cameraMoveReason

    val latDelta = bounds.northeast.latitude - bounds.southwest.latitude
    val lngDelta = bounds.northeast.longitude - bounds.southwest.longitude

    onCameraChange?.invoke(
      RNRegion(
        center = RNLatLng(bounds.center.latitude, bounds.center.longitude),
        latitudeDelta = latDelta,
        longitudeDelta = lngDelta,
      ),
      RNCamera(
        center = RNLatLng(cameraPosition.target.latitude, cameraPosition.target.longitude),
        zoom = cameraPosition.zoom.toDouble(),
        bearing = cameraPosition.bearing.toDouble(),
        tilt = cameraPosition.tilt.toDouble(),
      ),
      isGesture,
    )
    lastSubmittedCameraPosition = cameraPosition
  }

  override fun onCameraIdle() {
    val bounds = googleMap?.projection?.visibleRegion?.latLngBounds
    val cameraPosition = googleMap?.cameraPosition

    if (bounds == null || cameraPosition == null) {
      return
    }
    val isGesture = GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == cameraMoveReason

    val latDelta = bounds.northeast.latitude - bounds.southwest.latitude
    val lngDelta = bounds.northeast.longitude - bounds.southwest.longitude

    onCameraChangeComplete?.invoke(
      RNRegion(
        center = RNLatLng(bounds.center.latitude, bounds.center.longitude),
        latitudeDelta = latDelta,
        longitudeDelta = lngDelta,
      ),
      RNCamera(
        center = RNLatLng(cameraPosition.target.latitude, cameraPosition.target.longitude),
        zoom = cameraPosition.zoom.toDouble(),
        bearing = cameraPosition.bearing.toDouble(),
        tilt = cameraPosition.tilt.toDouble(),
      ),
      isGesture,
    )
  }

  @SuppressLint("PotentialBehaviorOverride")
  override fun onMapReady(map: GoogleMap) {
    googleMap = map
    googleMap?.setOnMapLoadedCallback {
      googleMap?.setOnCameraMoveStartedListener(this)
      googleMap?.setOnCameraMoveListener(this)
      googleMap?.setOnCameraIdleListener(this)
      googleMap?.setOnMarkerClickListener(this)
      googleMap?.setOnMapClickListener(this)
    }
    initLocationCallbacks()
    applyPending()

    onMapReady?.invoke(true)
  }

  fun initLocationCallbacks() {
    locationHandler.onUpdate = { location ->
      // / only the coordinated are relevant right now
      if (lastSubmittedLocation?.latitude != location.latitude || lastSubmittedLocation?.longitude != location.longitude ||
        lastSubmittedLocation?.bearing != location.bearing
      ) {
        onLocationUpdate?.invoke(
          RNLocation(
            RNLatLng(location.latitude, location.longitude),
            location.bearing.toDouble(),
          ),
        )
      }
      lastSubmittedLocation = location
    }

    locationHandler.onError = { error ->
      onLocationError?.invoke(error)
    }
    locationHandler.start()
  }

  fun applyPending() {
    onUi {
      pendingMapPadding?.let {
        googleMap?.setPadding(
          it.left.dpToPx().toInt(),
          it.top.dpToPx().toInt(),
          it.right.dpToPx().toInt(),
          it.bottom.dpToPx().toInt(),
        )
      }
      pendingInitialCamera?.let {
        googleMap?.moveCamera(
          CameraUpdateFactory.newCameraPosition(
            it,
          ),
        )
      }
      pendingBuildingEnabled?.let {
        googleMap?.isBuildingsEnabled = it
      }
      pendingTrafficEnabled?.let {
        googleMap?.isTrafficEnabled = it
      }
      googleMap?.setMapStyle(pendingCustomMapStyle)
      pendingMapType?.let {
        googleMap?.mapType = it
      }
      pendingUserInterfaceStyle?.let {
        googleMap?.mapColorScheme = it
      }
      pendingMinZoomLevel?.let {
        googleMap?.setMinZoomPreference(it.toFloat())
      }
      pendingMaxZoomLevel?.let {
        googleMap?.setMaxZoomPreference(it.toFloat())
      }
    }

    if (pendingMarkers.isNotEmpty()) {
      pendingMarkers.forEach { (id, opts) ->
        internalAddMarker(id, opts)
      }
      pendingMarkers.clear()
    }

    if (pendingPolylines.isNotEmpty()) {
      pendingPolylines.forEach { (id, opts) ->
        internalAddPolyline(id, opts)
      }
      pendingPolylines.clear()
    }

    if (pendingPolygons.isNotEmpty()) {
      pendingPolygons.forEach { (id, opts) ->
        internalAddPolygon(id, opts)
      }
      pendingPolygons.clear()
    }
  }

  var buildingEnabled: Boolean?
    get() = googleMap?.isBuildingsEnabled ?: pendingBuildingEnabled
    set(value) {
      pendingBuildingEnabled = value
      onUi {
        value?.let {
          googleMap?.isBuildingsEnabled = it
        }
          ?: run {
            googleMap?.isBuildingsEnabled = false
          }
      }
    }

  var trafficEnabled: Boolean?
    get() = googleMap?.isTrafficEnabled ?: pendingTrafficEnabled
    set(value) {
      pendingTrafficEnabled = value
      onUi {
        value?.let {
          googleMap?.isTrafficEnabled = it
        } ?: run {
          googleMap?.isTrafficEnabled = false
        }
      }
    }

  var customMapStyle: MapStyleOptions?
    get() = pendingCustomMapStyle
    set(value) {
      pendingCustomMapStyle = value
      onUi {
        googleMap?.setMapStyle(value)
      }
    }

  var initialCamera: CameraPosition?
    get() = pendingInitialCamera
    set(value) {
      pendingInitialCamera = value
    }

  var userInterfaceStyle: Int?
    get() = pendingUserInterfaceStyle
    set(value) {
      pendingUserInterfaceStyle = value
      onUi {
        value?.let {
          googleMap?.mapColorScheme = it
        } ?: run {
          googleMap?.mapColorScheme = MapColorScheme.FOLLOW_SYSTEM
        }
      }
    }

  var minZoomLevel: Double?
    get() = pendingMinZoomLevel
    set(value) {
      pendingMinZoomLevel = value
      onUi {
        value?.let {
          googleMap?.setMinZoomPreference(it.toFloat())
        } ?: run {
          googleMap?.setMinZoomPreference(2.0f)
        }
      }
    }

  var maxZoomLevel: Double?
    get() = pendingMaxZoomLevel
    set(value) {
      pendingMaxZoomLevel = value
      onUi {
        value?.let {
          googleMap?.setMaxZoomPreference(it.toFloat())
        } ?: run {
          googleMap?.setMaxZoomPreference(21.0f)
        }
      }
    }

  var mapPadding: RNMapPadding?
    get() = pendingMapPadding
    set(value) {
      pendingMapPadding = value
      value?.let {
        onUi {
          googleMap?.setPadding(
            it.left.dpToPx().toInt(),
            it.top.dpToPx().toInt(),
            it.right.dpToPx().toInt(),
            it.bottom.dpToPx().toInt(),
          )
        }
      } ?: run {
        googleMap?.setPadding(0, 0, 0, 0)
      }
    }

  var mapType: Int?
    get() = pendingMapType
    set(value) {
      pendingMapType = value
      onUi {
        value?.let {
          googleMap?.mapType = it
        } ?: run {
          googleMap?.mapType = 1
        }
      }
    }

  var onMapError: ((RNMapErrorCode) -> Unit)? = null
  var onMapReady: ((Boolean) -> Unit)? = null
  var onLocationUpdate: ((RNLocation) -> Unit)? = null
  var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
  var onMapPress: ((RNLatLng) -> Unit)? = null
  var onMarkerPress: ((String) -> Unit)? = null
  var onCameraChangeStart: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChange: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChangeComplete: ((RNRegion, RNCamera, Boolean) -> Unit)? = null

  fun setCamera(
    camera: RNCamera,
    animated: Boolean,
    durationMS: Int,
  ) {
    onUi {
      val current = googleMap?.cameraPosition
      if (current == null) {
        return@onUi
      }
      val camPosBuilder =
        CameraPosition.Builder(
          current,
        )

      camera.center?.let {
        camPosBuilder.target(
          LatLng(
            it.latitude,
            it.longitude,
          ),
        )
      }

      camera.zoom?.let {
        camPosBuilder.zoom(it.toFloat())
      }
      camera.bearing?.let {
        camPosBuilder.bearing(it.toFloat())
      }
      camera.tilt?.let {
        camPosBuilder.tilt(it.toFloat())
      }

      val camPos = camPosBuilder.build()

      val update = CameraUpdateFactory.newCameraPosition(camPos)

      if (animated) {
        googleMap?.animateCamera(update, durationMS, null)
      } else {
        googleMap?.moveCamera(update)
      }
    }
  }

  fun setCameraToCoordinates(
    coordinates: Array<RNLatLng>,
    padding: RNMapPadding,
    animated: Boolean,
    durationMS: Int,
  ) {
    if (coordinates.isEmpty()) {
      return
    }
    onUi {
      val builder = LatLngBounds.Builder()
      coordinates.forEach { coord ->
        builder.include(LatLng(coord.latitude, coord.longitude))
      }
      val bounds = builder.build()

      val latSpan = bounds.northeast.latitude - bounds.southwest.latitude
      val lngSpan = bounds.northeast.longitude - bounds.southwest.longitude

      val latPerPixel = latSpan / height
      val lngPerPixel = lngSpan / width

      builder.include(
        LatLng(
          bounds.northeast.latitude + (padding.top.dpToPx() * latPerPixel),
          bounds.northeast.longitude,
        ),
      )
      builder.include(
        LatLng(
          bounds.southwest.latitude - (padding.bottom.dpToPx() * latPerPixel),
          bounds.southwest.longitude,
        ),
      )
      builder.include(
        LatLng(
          bounds.northeast.latitude,
          bounds.northeast.longitude + (padding.right.dpToPx() * lngPerPixel),
        ),
      )
      builder.include(
        LatLng(
          bounds.southwest.latitude,
          bounds.southwest.longitude - (padding.left.dpToPx() * lngPerPixel),
        ),
      )

      val paddedBounds = builder.build()

      val adjustedWidth = (width - padding.left.dpToPx() - padding.right.dpToPx()).toInt()
      val adjustedHeight = (height - padding.top.dpToPx() - padding.bottom.dpToPx()).toInt()

      val update =
        CameraUpdateFactory.newLatLngBounds(
          paddedBounds,
          adjustedWidth,
          adjustedHeight,
          0,
        )
      if (animated) {
        googleMap?.animateCamera(update, durationMS, null)
      } else {
        googleMap?.moveCamera(update)
      }
    }
  }

  fun addMarker(
    id: String,
    opts: MarkerOptions,
  ) {
    if (googleMap == null) {
      pendingMarkers.add(id to opts)
      return
    }

    onUi {
      markersById.remove(id)?.remove()
    }
    internalAddMarker(id, opts)
  }

  private fun internalAddMarker(
    id: String,
    opts: MarkerOptions,
  ) {
    onUi {
      val marker =
        googleMap?.addMarker(opts).also {
          it?.tag = id
        }
      if (marker != null) {
        markersById[id] = marker
      }
    }
  }

  fun updateMarker(
    id: String,
    block: (Marker) -> Unit,
  ) {
    val marker = markersById[id] ?: return
    onUi {
      block(marker)
    }
  }

  fun removeMarker(id: String) {
    onUi {
      val marker = markersById.remove(id)
      marker?.remove()
    }
  }

  fun clearMarkers() {
    onUi {
      markersById.values.forEach { it.remove() }
    }
    markersById.clear()
    pendingMarkers.clear()
  }

  fun addPolyline(
    id: String,
    opts: PolylineOptions,
  ) {
    if (googleMap == null) {
      pendingPolylines.add(id to opts)
      return
    }
    onUi {
      polylinesById.remove(id)?.remove()
    }
    internalAddPolyline(id, opts)
  }

  private fun internalAddPolyline(
    id: String,
    opts: PolylineOptions,
  ) {
    onUi {
      val polyline =
        googleMap?.addPolyline(opts).also {
          it?.tag = id
        }
      if (polyline != null) {
        polylinesById[id] = polyline
      }
    }
  }

  fun updatePolyline(
    id: String,
    block: (Polyline) -> Unit,
  ) {
    val pl = polylinesById[id] ?: return
    onUi {
      block(pl)
    }
  }

  fun removePolyline(id: String) {
    onUi {
      polylinesById.remove(id)?.remove()
    }
  }

  fun clearPolylines() {
    onUi {
      polylinesById.values.forEach { it.remove() }
    }
    polylinesById.clear()
    pendingPolylines.clear()
  }

  fun addPolygon(
    id: String,
    opts: PolygonOptions,
  ) {
    if (googleMap == null) {
      pendingPolygons.add(id to opts)
      return
    }

    onUi {
      polygonsById.remove(id)?.remove()
    }
    internalAddPolygon(id, opts)
  }

  private fun internalAddPolygon(
    id: String,
    opts: PolygonOptions,
  ) {
    onUi {
      val polygon =
        googleMap?.addPolygon(opts).also {
          it?.tag = id
        }
      if (polygon != null) {
        polygonsById[id] = polygon
      }
    }
  }

  fun updatePolygon(
    id: String,
    block: (Polygon) -> Unit,
  ) {
    val polygon = polygonsById[id] ?: return
    onUi {
      block(polygon)
    }
  }

  fun removePolygon(id: String) {
    onUi {
      polygonsById.remove(id)?.remove()
    }
  }

  fun clearPolygons() {
    onUi {
      polygonsById.values.forEach { it.remove() }
    }
    polygonsById.clear()
    pendingPolygons.clear()
  }

  fun clearAll() {
    onUi {
      markerOptions.cancelAllJobs()
      clearMarkers()
      clearPolylines()
      clearPolygons()
      locationHandler.stop()
      googleMap?.apply {
        setOnCameraMoveStartedListener(null)
        setOnCameraMoveListener(null)
        setOnCameraIdleListener(null)
        setOnMarkerClickListener(null)
        setOnMapClickListener(null)
      }
      this@GoogleMapsViewImpl.onDestroy()
      googleMap = null
      reactContext.removeLifecycleEventListener(this)
    }
  }

  override fun requestLayout() {
    super.requestLayout()
    // / setPadding issue
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
    locationHandler.start()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    locationHandler.stop()
  }

  override fun onHostResume() {
    onUi {
      locationHandler.start()
      this@GoogleMapsViewImpl.onResume()
    }
  }

  override fun onHostPause() {
    onUi {
      locationHandler.stop()
      this@GoogleMapsViewImpl.onPause()
    }
  }

  override fun onHostDestroy() {
    clearAll()
  }

  override fun onMarkerClick(marker: Marker): Boolean {
    onMarkerPress?.invoke(marker.tag?.toString() ?: "unknown")
    return true
  }

  override fun onMapClick(coordinates: LatLng) {
    onMapPress?.invoke(
      RNLatLng(coordinates.latitude, coordinates.longitude),
    )
  }
}

private inline fun onUi(crossinline block: () -> Unit) {
  if (UiThreadUtil.isOnUiThread()) {
    block()
  } else {
    UiThreadUtil.runOnUiThread { block() }
  }
}
