package com.rngooglemapsplus

import android.annotation.SuppressLint
import android.location.Location
import android.widget.FrameLayout
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.GoogleMapOptions
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.CircleOptions
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
import com.google.android.gms.maps.model.TileOverlay
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.maps.android.data.kml.KmlLayer
import com.rngooglemapsplus.extensions.toGooglePriority
import com.rngooglemapsplus.extensions.toLocationErrorCode
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

class GoogleMapsViewImpl(
  val reactContext: ThemedReactContext,
  val locationHandler: LocationHandler,
  val playServiceHandler: PlayServicesHandler,
  val markerBuilder: MapMarkerBuilder,
) : FrameLayout(reactContext),
  GoogleMap.OnCameraMoveStartedListener,
  GoogleMap.OnCameraMoveListener,
  GoogleMap.OnCameraIdleListener,
  GoogleMap.OnMapClickListener,
  GoogleMap.OnMarkerClickListener,
  GoogleMap.OnPolylineClickListener,
  GoogleMap.OnPolygonClickListener,
  GoogleMap.OnCircleClickListener,
  LifecycleEventListener {
  private var initialized = false
  private var mapReady = false
  private var googleMap: GoogleMap? = null
  private var mapView: MapView? = null

  private val pendingMarkers = mutableListOf<Pair<String, MarkerOptions>>()
  private val pendingPolylines = mutableListOf<Pair<String, PolylineOptions>>()
  private val pendingPolygons = mutableListOf<Pair<String, PolygonOptions>>()
  private val pendingCircles = mutableListOf<Pair<String, CircleOptions>>()
  private val pendingHeatmaps = mutableListOf<Pair<String, TileOverlayOptions>>()
  private val pendingKmlLayers = mutableListOf<Pair<String, String>>()

  private val markersById = mutableMapOf<String, Marker>()
  private val polylinesById = mutableMapOf<String, Polyline>()
  private val polygonsById = mutableMapOf<String, Polygon>()
  private val circlesById = mutableMapOf<String, Circle>()
  private val heatmapsById = mutableMapOf<String, TileOverlay>()
  private val kmlLayersById = mutableMapOf<String, KmlLayer>()

  private var cameraMoveReason = -1
  private var lastSubmittedLocation: Location? = null
  private var lastSubmittedCameraPosition: CameraPosition? = null

  init {
    reactContext.addLifecycleEventListener(this)
  }

  fun initMapView(
    mapId: String?,
    liteMode: Boolean?,
    cameraPosition: CameraPosition?,
  ) {
    if (initialized) return
    initialized = true
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

    mapView =
      MapView(
        reactContext,
        GoogleMapOptions().apply {
          mapId?.let { mapId(it) }
          liteMode?.let { liteMode(it) }
          cameraPosition?.let {
            camera(it)
          }
        },
      )

    super.addView(mapView)

    mapView?.onCreate(null)
    mapView?.getMapAsync { map ->
      googleMap = map
      googleMap?.setOnMapLoadedCallback {
        googleMap?.setOnCameraMoveStartedListener(this@GoogleMapsViewImpl)
        googleMap?.setOnCameraMoveListener(this@GoogleMapsViewImpl)
        googleMap?.setOnCameraIdleListener(this@GoogleMapsViewImpl)
        googleMap?.setOnMarkerClickListener(this@GoogleMapsViewImpl)
        googleMap?.setOnPolylineClickListener(this@GoogleMapsViewImpl)
        googleMap?.setOnPolygonClickListener(this@GoogleMapsViewImpl)
        googleMap?.setOnCircleClickListener(this@GoogleMapsViewImpl)
        googleMap?.setOnMapClickListener(this@GoogleMapsViewImpl)
      }
      initLocationCallbacks()
      applyPending()
    }
    mapReady = true
    onMapReady?.invoke(true)
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
      mapPadding?.let {
        googleMap?.setPadding(
          it.left.dpToPx().toInt(),
          it.top.dpToPx().toInt(),
          it.right.dpToPx().toInt(),
          it.bottom.dpToPx().toInt(),
        )
      }

      uiSettings?.let { v ->
        googleMap?.uiSettings?.apply {
          v.allGesturesEnabled?.let { setAllGesturesEnabled(it) }
          v.compassEnabled?.let { isCompassEnabled = it }
          v.indoorLevelPickerEnabled?.let { isIndoorLevelPickerEnabled = it }
          v.mapToolbarEnabled?.let { isMapToolbarEnabled = it }
          v.myLocationButtonEnabled?.let {
            googleMap?.setLocationSource(locationHandler)
            isMyLocationButtonEnabled = it
          }
          v.rotateEnabled?.let { isRotateGesturesEnabled = it }
          v.scrollEnabled?.let { isScrollGesturesEnabled = it }
          v.scrollDuringRotateOrZoomEnabled?.let {
            isScrollGesturesEnabledDuringRotateOrZoom = it
          }
          v.tiltEnabled?.let { isTiltGesturesEnabled = it }
          v.zoomControlsEnabled?.let { isZoomControlsEnabled = it }
          v.zoomGesturesEnabled?.let { isZoomGesturesEnabled = it }
        }
      }

      buildingEnabled?.let {
        googleMap?.isBuildingsEnabled = it
      }
      trafficEnabled?.let {
        googleMap?.isTrafficEnabled = it
      }
      indoorEnabled?.let {
        googleMap?.isIndoorEnabled = it
      }
      googleMap?.setMapStyle(customMapStyle)
      mapType?.let {
        googleMap?.mapType = it
      }
      userInterfaceStyle?.let {
        googleMap?.mapColorScheme = it
      }
      mapZoomConfig?.let {
        googleMap?.setMinZoomPreference(it.min?.toFloat() ?: 2.0f)
        googleMap?.setMaxZoomPreference(it.max?.toFloat() ?: 21.0f)
      }
    }

    locationConfig?.let {
      locationHandler.priority = it.android?.priority?.toGooglePriority()
      locationHandler.interval = it.android?.interval?.toLong()
      locationHandler.minUpdateInterval = it.android?.minUpdateInterval?.toLong()
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

    if (pendingCircles.isNotEmpty()) {
      pendingCircles.forEach { (id, opts) ->
        internalAddCircle(id, opts)
      }
      pendingCircles.clear()
    }

    if (pendingHeatmaps.isNotEmpty()) {
      pendingHeatmaps.forEach { (id, opts) ->
        internalAddHeatmap(id, opts)
      }
      pendingHeatmaps.clear()
    }

    if (pendingKmlLayers.isNotEmpty()) {
      pendingKmlLayers.forEach { (id, string) ->
        internalAddKmlLayer(id, string)
      }
      pendingKmlLayers.clear()
    }
  }

  var uiSettings: RNMapUiSettings? = null
    set(value) {
      field = value
      onUi {
        googleMap?.uiSettings?.apply {
          setAllGesturesEnabled(value?.allGesturesEnabled ?: true)
          isCompassEnabled = value?.compassEnabled ?: false
          isIndoorLevelPickerEnabled = value?.indoorLevelPickerEnabled ?: false
          isMapToolbarEnabled = value?.mapToolbarEnabled ?: false

          val myLocationEnabled = value?.myLocationButtonEnabled ?: false
          googleMap?.setLocationSource(if (myLocationEnabled) locationHandler else null)
          isMyLocationButtonEnabled = myLocationEnabled

          isRotateGesturesEnabled = value?.rotateEnabled ?: true
          isScrollGesturesEnabled = value?.scrollEnabled ?: true
          isScrollGesturesEnabledDuringRotateOrZoom =
            value?.scrollDuringRotateOrZoomEnabled ?: true
          isTiltGesturesEnabled = value?.tiltEnabled ?: true
          isZoomControlsEnabled = value?.zoomControlsEnabled ?: false
          isZoomGesturesEnabled = value?.zoomGesturesEnabled ?: false
        }
      }
    }

  @SuppressLint("MissingPermission")
  var myLocationEnabled: Boolean? = null
    set(value) {
      field = value
      onUi {
        try {
          googleMap?.isMyLocationEnabled = value ?: false
        } catch (se: SecurityException) {
          onLocationError?.invoke(RNLocationErrorCode.PERMISSION_DENIED)
        } catch (ex: Exception) {
          val error = ex.toLocationErrorCode(context)
          onLocationError?.invoke(error)
        }
      }
    }

  var buildingEnabled: Boolean? = null
    set(value) {
      field = value
      onUi {
        googleMap?.isBuildingsEnabled = value ?: false
      }
    }

  var trafficEnabled: Boolean? = null
    set(value) {
      field = value
      onUi {
        googleMap?.isTrafficEnabled = value ?: false
      }
    }

  var indoorEnabled: Boolean? = null
    set(value) {
      field = value
      onUi {
        googleMap?.isIndoorEnabled = value ?: false
      }
    }

  var customMapStyle: MapStyleOptions? = null
    set(value) {
      field = value
      onUi {
        googleMap?.setMapStyle(value)
      }
    }

  var userInterfaceStyle: Int? = null
    set(value) {
      field = value
      onUi {
        googleMap?.mapColorScheme = value ?: MapColorScheme.FOLLOW_SYSTEM
      }
    }

  var mapZoomConfig: RNMapZoomConfig? = null
    set(value) {
      field = value
      onUi {
        googleMap?.setMinZoomPreference(value?.min?.toFloat() ?: 2.0f)
        googleMap?.setMaxZoomPreference(value?.max?.toFloat() ?: 21.0f)
      }
    }

  var mapPadding: RNMapPadding? = null
    set(value) {
      field = value
      onUi {
        googleMap?.setPadding(
          value?.left?.dpToPx()?.toInt() ?: 0,
          value?.top?.dpToPx()?.toInt() ?: 0,
          value?.right?.dpToPx()?.toInt() ?: 0,
          value?.bottom?.dpToPx()?.toInt() ?: 0,
        )
      }
    }

  var mapType: Int? = null
    set(value) {
      field = value
      onUi {
        googleMap?.mapType = value ?: 1
      }
    }

  var locationConfig: RNLocationConfig? = null
    set(value) {
      field = value
      locationHandler.priority = value?.android?.priority?.toGooglePriority()
      locationHandler.interval = value?.android?.interval?.toLong()
      locationHandler.minUpdateInterval = value?.android?.minUpdateInterval?.toLong()
    }

  var onMapError: ((RNMapErrorCode) -> Unit)? = null
  var onMapReady: ((Boolean) -> Unit)? = null
  var onLocationUpdate: ((RNLocation) -> Unit)? = null
  var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
  var onMapPress: ((RNLatLng) -> Unit)? = null
  var onMarkerPress: ((String) -> Unit)? = null
  var onPolylinePress: ((String) -> Unit)? = null
  var onPolygonPress: ((String) -> Unit)? = null
  var onCirclePress: ((String) -> Unit)? = null
  var onCameraChangeStart: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChange: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChangeComplete: ((RNRegion, RNCamera, Boolean) -> Unit)? = null

  fun setCamera(
    cameraPosition: CameraPosition,
    animated: Boolean,
    durationMS: Int,
  ) {
    onUi {
      val current = googleMap?.cameraPosition
      if (current == null) {
        return@onUi
      }

      val update = CameraUpdateFactory.newCameraPosition(cameraPosition)

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

      val latPerPixel = latSpan / (mapView?.height ?: 0)
      val lngPerPixel = lngSpan / (mapView?.width ?: 0)

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

      val adjustedWidth =
        ((mapView?.width ?: 0) - padding.left.dpToPx() - padding.right.dpToPx()).toInt()
      val adjustedHeight =
        ((mapView?.height ?: 0) - padding.top.dpToPx() - padding.bottom.dpToPx()).toInt()

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

  fun addCircle(
    id: String,
    opts: CircleOptions,
  ) {
    if (googleMap == null) {
      pendingCircles.add(id to opts)
      return
    }

    onUi {
      circlesById.remove(id)?.remove()
    }
    internalAddCircle(id, opts)
  }

  private fun internalAddCircle(
    id: String,
    opts: CircleOptions,
  ) {
    onUi {
      val circle =
        googleMap?.addCircle(opts).also {
          it?.tag = id
        }
      if (circle != null) {
        circlesById[id] = circle
      }
    }
  }

  fun updateCircle(
    id: String,
    block: (Circle) -> Unit,
  ) {
    val circle = circlesById[id] ?: return
    onUi {
      block(circle)
    }
  }

  fun removeCircle(id: String) {
    onUi {
      circlesById.remove(id)?.remove()
    }
  }

  fun clearCircles() {
    onUi {
      circlesById.values.forEach { it.remove() }
    }
    circlesById.clear()
    pendingCircles.clear()
  }

  fun addHeatmap(
    id: String,
    opts: TileOverlayOptions,
  ) {
    if (googleMap == null) {
      pendingHeatmaps.add(id to opts)
      return
    }

    onUi {
      heatmapsById.remove(id)?.remove()
    }
    internalAddHeatmap(id, opts)
  }

  private fun internalAddHeatmap(
    id: String,
    opts: TileOverlayOptions,
  ) {
    onUi {
      val heatmap =
        googleMap?.addTileOverlay(opts)
      if (heatmap != null) {
        heatmapsById[id] = heatmap
      }
    }
  }

  fun removeHeatmap(id: String) {
    onUi {
      heatmapsById.remove(id)?.remove()
    }
  }

  fun clearHeatmaps() {
    onUi {
      heatmapsById.values.forEach { it.remove() }
    }
    circlesById.clear()
    pendingHeatmaps.clear()
  }

  fun addKmlLayer(
    id: String,
    kmlString: String,
  ) {
    if (googleMap == null) {
      pendingKmlLayers.add(id to kmlString)
      return
    }
    onUi {
      kmlLayersById.remove(id)?.removeLayerFromMap()
    }
    internalAddKmlLayer(id, kmlString)
  }

  private fun internalAddKmlLayer(
    id: String,
    kmlString: String,
  ) {
    onUi {
      try {
        val inputStream = ByteArrayInputStream(kmlString.toByteArray(StandardCharsets.UTF_8))
        val layer = KmlLayer(googleMap, inputStream, context)
        kmlLayersById[id] = layer
        layer.addLayerToMap()
      } catch (e: Exception) {
        // / ignore
      }
    }
  }

  fun removeKmlLayer(id: String) {
    onUi {
      kmlLayersById.remove(id)?.removeLayerFromMap()
    }
  }

  fun clearKmlLayer() {
    onUi {
      kmlLayersById.values.forEach { it.removeLayerFromMap() }
    }
    kmlLayersById.clear()
    pendingKmlLayers.clear()
  }

  fun destroyInternal() {
    onUi {
      markerBuilder.cancelAllJobs()
      clearMarkers()
      clearPolylines()
      clearPolygons()
      clearCircles()
      clearHeatmaps()
      clearKmlLayer()
      locationHandler.stop()
      googleMap?.apply {
        setOnCameraMoveStartedListener(null)
        setOnCameraMoveListener(null)
        setOnCameraIdleListener(null)
        setOnMarkerClickListener(null)
        setOnPolylineClickListener(null)
        setOnPolygonClickListener(null)
        setOnCircleClickListener(null)
        setOnMapClickListener(null)
      }
      googleMap = null
      mapView?.apply {
        onPause()
        onStop()
        onDestroy()
        removeAllViews()
      }
      super.removeAllViews()
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
      mapView?.onResume()
    }
  }

  override fun onHostPause() {
    onUi {
      locationHandler.stop()
      mapView?.onPause()
    }
  }

  override fun onHostDestroy() {
    destroyInternal()
  }

  override fun onMarkerClick(marker: Marker): Boolean {
    onMarkerPress?.invoke(marker.tag?.toString() ?: "unknown")
    return true
  }

  override fun onPolylineClick(polyline: Polyline) {
    onPolylinePress?.invoke(polyline.tag?.toString() ?: "unknown")
  }

  override fun onPolygonClick(polygon: Polygon) {
    onPolygonPress?.invoke(polygon.tag?.toString() ?: "unknown")
  }

  override fun onCircleClick(circle: Circle) {
    onCirclePress?.invoke(circle.tag?.toString() ?: "unknown")
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
