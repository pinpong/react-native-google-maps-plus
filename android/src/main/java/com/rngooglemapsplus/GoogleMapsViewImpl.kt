package com.rngooglemapsplus

import CircleTag
import MarkerTag
import PolygonTag
import PolylineTag
import android.annotation.SuppressLint
import android.content.ComponentCallbacks2
import android.content.res.Configuration
import android.graphics.Bitmap
import android.location.Location
import android.util.Size
import android.view.View
import android.widget.FrameLayout
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.findViewTreeLifecycleOwner
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.GoogleMapOptions
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.MapsInitializer
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.CircleOptions
import com.google.android.gms.maps.model.IndoorBuilding
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MapColorScheme
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.PointOfInterest
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.PolygonOptions
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions
import com.google.android.gms.maps.model.TileOverlay
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.maps.android.data.kml.KmlLayer
import com.margelo.nitro.core.Promise
import com.rngooglemapsplus.extensions.encode
import com.rngooglemapsplus.extensions.toGooglePriority
import com.rngooglemapsplus.extensions.toLatLng
import com.rngooglemapsplus.extensions.toLocationErrorCode
import com.rngooglemapsplus.extensions.toRNIndoorBuilding
import com.rngooglemapsplus.extensions.toRNIndoorLevel
import com.rngooglemapsplus.extensions.toRNMapErrorCodeOrNull
import com.rngooglemapsplus.extensions.toRnCamera
import com.rngooglemapsplus.extensions.toRnLatLng
import com.rngooglemapsplus.extensions.toRnLocation
import com.rngooglemapsplus.extensions.toRnRegion
import idTag
import tagData
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
  GoogleMap.OnMapLongClickListener,
  GoogleMap.OnPoiClickListener,
  GoogleMap.OnMarkerClickListener,
  GoogleMap.OnPolylineClickListener,
  GoogleMap.OnPolygonClickListener,
  GoogleMap.OnCircleClickListener,
  GoogleMap.OnMarkerDragListener,
  GoogleMap.OnIndoorStateChangeListener,
  GoogleMap.OnInfoWindowClickListener,
  GoogleMap.OnInfoWindowCloseListener,
  GoogleMap.OnInfoWindowLongClickListener,
  GoogleMap.OnMyLocationClickListener,
  GoogleMap.OnMyLocationButtonClickListener,
  GoogleMap.InfoWindowAdapter {
  private var lifecycleObserver: MapLifecycleEventObserver? = null
  private var lifecycle: Lifecycle? = null

  private var mapViewInitialized = false
  private var mapViewLoaded = false
  private var destroyed = false
  private var googleMap: GoogleMap? = null
  private var mapView: MapView? = null

  private val pendingMarkers = mutableListOf<Triple<String, MarkerOptions, MarkerTag>>()
  private val pendingPolylines = mutableListOf<Pair<String, PolylineOptions>>()
  private val pendingPolygons = mutableListOf<Pair<String, PolygonOptions>>()
  private val pendingCircles = mutableListOf<Pair<String, CircleOptions>>()
  private val pendingHeatmaps = mutableListOf<Pair<String, TileOverlayOptions>>()
  private val pendingKmlLayers = mutableListOf<Pair<String, String>>()
  private val pendingUrlTilesOverlays = mutableListOf<Pair<String, TileOverlayOptions>>()

  private val markersById = mutableMapOf<String, Marker>()
  private val polylinesById = mutableMapOf<String, Polyline>()
  private val polygonsById = mutableMapOf<String, Polygon>()
  private val circlesById = mutableMapOf<String, Circle>()
  private val heatmapsById = mutableMapOf<String, TileOverlay>()
  private val kmlLayersById = mutableMapOf<String, KmlLayer>()
  private val urlTileOverlaysById = mutableMapOf<String, TileOverlay>()

  private var cameraMoveReason = -1

  val componentCallbacks =
    object : ComponentCallbacks2 {
      override fun onConfigurationChanged(newConfig: Configuration) {}

      override fun onLowMemory() {
        mapView?.onLowMemory()
        markerBuilder.clearIconCache()
      }

      override fun onTrimMemory(level: Int) {
        mapView?.onLowMemory()
        markerBuilder.cancelAllJobs()
      }
    }

  init {
    MapsInitializer.initialize(reactContext)
    reactContext.registerComponentCallbacks(componentCallbacks)
  }

  fun initMapView() =
    onUi {
      if (mapViewInitialized) return@onUi
      mapViewInitialized = true

      val result = playServiceHandler.playServicesAvailability()
      val errorCode = result.toRNMapErrorCodeOrNull()
      if (errorCode != null) {
        onMapError?.invoke(errorCode)
        if (errorCode == RNMapErrorCode.PLAY_SERVICES_MISSING ||
          errorCode == RNMapErrorCode.PLAY_SERVICES_INVALID
        ) {
          return@onUi
        }
      }

      mapView =
        MapView(reactContext, googleMapsOptions).also {
          lifecycleObserver = MapLifecycleEventObserver(it, locationHandler)
          super.addView(it)
          it.getMapAsync { map ->
            googleMap = map
            googleMap?.setLocationSource(locationHandler)
            googleMap?.setOnMapLoadedCallback {
              googleMap?.setOnCameraMoveStartedListener(this@GoogleMapsViewImpl)
              googleMap?.setOnCameraMoveListener(this@GoogleMapsViewImpl)
              googleMap?.setOnCameraIdleListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMarkerClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnPolylineClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnPolygonClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnCircleClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMapClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMapLongClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnPoiClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMarkerDragListener(this@GoogleMapsViewImpl)
              googleMap?.setOnInfoWindowClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnInfoWindowCloseListener(this@GoogleMapsViewImpl)
              googleMap?.setOnInfoWindowLongClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMyLocationClickListener(this@GoogleMapsViewImpl)
              googleMap?.setOnMyLocationButtonClickListener(this@GoogleMapsViewImpl)
              googleMap?.setInfoWindowAdapter(this@GoogleMapsViewImpl)
              mapViewLoaded = true
              onMapLoaded?.invoke(
                map.projection.visibleRegion.toRnRegion(),
                map.cameraPosition.toRnCamera(),
              )
            }
            applyProps()
            initLocationCallbacks()
            onMapReady?.invoke(true)
          }
        }
    }

  override fun onCameraMoveStarted(reason: Int) =
    onUi {
      if (!mapViewLoaded) return@onUi
      cameraMoveReason = reason
      val visibleRegion = googleMap?.projection?.visibleRegion ?: return@onUi
      val cameraPosition = googleMap?.cameraPosition ?: return@onUi
      onCameraChangeStart?.invoke(
        visibleRegion.toRnRegion(),
        cameraPosition.toRnCamera(),
        GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == reason,
      )
    }

  override fun onCameraMove() =
    onUi {
      if (!mapViewLoaded) return@onUi
      val visibleRegion = googleMap?.projection?.visibleRegion ?: return@onUi
      val cameraPosition = googleMap?.cameraPosition ?: return@onUi
      val gesture = GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == cameraMoveReason
      onCameraChange?.invoke(
        visibleRegion.toRnRegion(),
        cameraPosition.toRnCamera(),
        gesture,
      )
    }

  override fun onCameraIdle() =
    onUi {
      if (!mapViewLoaded) return@onUi
      val visibleRegion = googleMap?.projection?.visibleRegion ?: return@onUi
      val cameraPosition = googleMap?.cameraPosition ?: return@onUi
      val gesture = GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE == cameraMoveReason
      onCameraChangeComplete?.invoke(
        visibleRegion.toRnRegion(),
        cameraPosition.toRnCamera(),
        gesture,
      )
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
    mapPadding = mapPadding
    uiSettings = uiSettings
    myLocationEnabled = myLocationEnabled
    buildingEnabled = buildingEnabled
    trafficEnabled = trafficEnabled
    indoorEnabled = indoorEnabled
    customMapStyle = customMapStyle
    mapType = mapType
    userInterfaceStyle = userInterfaceStyle
    mapZoomConfig = mapZoomConfig
    locationConfig = locationConfig

    if (pendingMarkers.isNotEmpty()) {
      pendingMarkers.forEach { (id, opts, markerTag) -> addMarkerInternal(id, opts, markerTag) }
      pendingMarkers.clear()
    }
    if (pendingPolylines.isNotEmpty()) {
      pendingPolylines.forEach { (id, opts) -> addPolylineInternal(id, opts) }
      pendingPolylines.clear()
    }
    if (pendingPolygons.isNotEmpty()) {
      pendingPolygons.forEach { (id, opts) -> addPolygonInternal(id, opts) }
      pendingPolygons.clear()
    }
    if (pendingCircles.isNotEmpty()) {
      pendingCircles.forEach { (id, opts) -> addCircleInternal(id, opts) }
      pendingCircles.clear()
    }
    if (pendingHeatmaps.isNotEmpty()) {
      pendingHeatmaps.forEach { (id, opts) -> addHeatmapInternal(id, opts) }
      pendingHeatmaps.clear()
    }
    if (pendingKmlLayers.isNotEmpty()) {
      pendingKmlLayers.forEach { (id, str) -> addKmlLayerInternal(id, str) }
      pendingKmlLayers.clear()
    }
    if (pendingUrlTilesOverlays.isNotEmpty()) {
      pendingUrlTilesOverlays.forEach { (id, opts) -> addUrlTileOverlayInternal(id, opts) }
      pendingUrlTilesOverlays.clear()
    }
  }

  val currentCamera: CameraPosition?
    get() = onUiSync { googleMap?.cameraPosition }

  var googleMapsOptions: GoogleMapOptions = GoogleMapOptions()

  var uiSettings: RNMapUiSettings? = null
    set(value) {
      field = value
      onUi {
        googleMap?.uiSettings?.apply {
          setAllGesturesEnabled(value?.allGesturesEnabled ?: true)
          isCompassEnabled = value?.compassEnabled ?: false
          isIndoorLevelPickerEnabled = value?.indoorLevelPickerEnabled ?: false
          isMapToolbarEnabled = value?.mapToolbarEnabled ?: false
          isMyLocationButtonEnabled = value?.myLocationButtonEnabled ?: false
          isRotateGesturesEnabled = value?.rotateEnabled ?: true
          isScrollGesturesEnabled = value?.scrollEnabled ?: true
          isScrollGesturesEnabledDuringRotateOrZoom =
            value?.scrollDuringRotateOrZoomEnabled ?: true
          isTiltGesturesEnabled = value?.tiltEnabled ?: true
          isZoomControlsEnabled = value?.zoomControlsEnabled ?: false
          isZoomGesturesEnabled = value?.zoomGesturesEnabled ?: true
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
        } catch (_: SecurityException) {
          onLocationError?.let { cb -> cb(RNLocationErrorCode.PERMISSION_DENIED) }
        } catch (ex: Exception) {
          val error = ex.toLocationErrorCode(context)
          onLocationError?.invoke(error)
        }
      }
    }

  var buildingEnabled: Boolean? = null
    set(value) {
      field = value
      onUi { googleMap?.isBuildingsEnabled = value ?: false }
    }

  var trafficEnabled: Boolean? = null
    set(value) {
      field = value
      onUi { googleMap?.isTrafficEnabled = value ?: false }
    }

  var indoorEnabled: Boolean? = null
    set(value) {
      field = value
      onUi { googleMap?.isIndoorEnabled = value ?: false }
    }

  var customMapStyle: MapStyleOptions? = null
    set(value) {
      field = value
      onUi { googleMap?.setMapStyle(value) }
    }

  var userInterfaceStyle: Int? = null
    set(value) {
      field = value
      onUi {
        try {
          // / not supported when liteMode enabled on latest renderer
          googleMap?.mapColorScheme = value ?: MapColorScheme.FOLLOW_SYSTEM
        } catch (_: UnsupportedOperationException) {
          // / ignore
        }
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
      onUi { googleMap?.mapType = value ?: 1 }
    }

  var locationConfig: RNLocationConfig? = null
    set(value) {
      field = value
      locationHandler.updateConfig(
        value?.android?.priority?.toGooglePriority(),
        value?.android?.interval?.toLong(),
        value?.android?.minUpdateInterval?.toLong(),
      )
    }

  var onMapError: ((RNMapErrorCode) -> Unit)? = null
  var onMapReady: ((Boolean) -> Unit)? = null
  var onMapLoaded: ((RNRegion, RNCamera) -> Unit)? = null
  var onLocationUpdate: ((RNLocation) -> Unit)? = null
  var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
  var onMapPress: ((RNLatLng) -> Unit)? = null
  var onMapLongPress: ((RNLatLng) -> Unit)? = null
  var onPoiPress: ((String, String, RNLatLng) -> Unit)? = null
  var onMarkerPress: ((String) -> Unit)? = null
  var onPolylinePress: ((String) -> Unit)? = null
  var onPolygonPress: ((String) -> Unit)? = null
  var onCirclePress: ((String) -> Unit)? = null
  var onMarkerDragStart: ((String, RNLatLng) -> Unit)? = null
  var onMarkerDrag: ((String, RNLatLng) -> Unit)? = null
  var onMarkerDragEnd: ((String, RNLatLng) -> Unit)? = null
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Unit)? = null
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Unit)? = null
  var onInfoWindowPress: ((String) -> Unit)? = null
  var onInfoWindowClose: ((String) -> Unit)? = null
  var onInfoWindowLongPress: ((String) -> Unit)? = null
  var onMyLocationPress: ((RNLocation) -> Unit)? = null
  var onMyLocationButtonPress: ((Boolean) -> Unit)? = null
  var onCameraChangeStart: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChange: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChangeComplete: ((RNRegion, RNCamera, Boolean) -> Unit)? = null

  fun showMarkerInfoWindow(id: String) =
    onUi {
      val marker = markersById[id] ?: return@onUi
      marker.showInfoWindow()
    }

  fun hideMarkerInfoWindow(id: String) =
    onUi {
      val marker = markersById[id] ?: return@onUi
      marker.hideInfoWindow()
    }

  fun setCamera(
    cameraPosition: CameraPosition,
    animated: Boolean,
    durationMs: Int,
  ) = onUi {
    val update = CameraUpdateFactory.newCameraPosition(cameraPosition)
    if (animated) {
      googleMap?.animateCamera(update, durationMs, null)
    } else {
      googleMap?.moveCamera(update)
    }
  }

  fun setCameraToCoordinates(
    coordinates: Array<RNLatLng>,
    padding: RNMapPadding,
    animated: Boolean,
    durationMs: Int,
  ) = onUi {
    if (coordinates.isEmpty()) return@onUi

    val bounds =
      LatLngBounds
        .builder()
        .apply {
          coordinates.forEach { include(it.toLatLng()) }
        }.build()

    val previousMapPadding = mapPadding
    mapPadding = padding

    val update = CameraUpdateFactory.newLatLngBounds(bounds, 0)

    if (animated) {
      googleMap?.animateCamera(update, durationMs, null)
    } else {
      googleMap?.moveCamera(update)
    }

    mapPadding = previousMapPadding
  }

  fun setCameraBounds(bounds: LatLngBounds?) =
    onUi {
      googleMap?.setLatLngBoundsForCameraTarget(bounds)
    }

  fun animateToBounds(
    bounds: LatLngBounds,
    padding: Int,
    durationMs: Int,
    lockBounds: Boolean,
  ) = onUi {
    if (lockBounds) {
      googleMap?.setLatLngBoundsForCameraTarget(bounds)
    }
    val update = CameraUpdateFactory.newLatLngBounds(bounds, padding)
    googleMap?.animateCamera(update, durationMs, null)
  }

  fun snapshot(
    size: Size?,
    format: String,
    compressFormat: Bitmap.CompressFormat,
    quality: Double,
    resultIsFile: Boolean,
  ): Promise<String?> {
    val promise = Promise<String?>()
    onUi {
      googleMap?.snapshot { bitmap ->
        bitmap
          ?.encode(context, size, format, compressFormat, quality, resultIsFile)
          ?.let(promise::resolve) ?: promise.resolve(null)
      }
    }
    return promise
  }

  fun addMarker(
    id: String,
    opts: MarkerOptions,
    markerTag: MarkerTag,
  ) = onUi {
    if (googleMap == null) {
      pendingMarkers.add(Triple(id, opts, markerTag))
      return@onUi
    }

    markersById.remove(id)?.remove()
    addMarkerInternal(id, opts, markerTag)
  }

  private fun addMarkerInternal(
    id: String,
    opts: MarkerOptions,
    markerTag: MarkerTag,
  ) = onUi {
    val marker =
      googleMap?.addMarker(opts)?.apply {
        tag = markerTag
      }

    if (marker != null) {
      markersById[id] = marker
    }
  }

  fun updateMarker(
    id: String,
    block: (Marker) -> Unit,
  ) = onUi {
    val marker = markersById[id] ?: return@onUi
    block(marker)
    if (marker.isInfoWindowShown) {
      marker.hideInfoWindow()
      marker.showInfoWindow()
    }
  }

  fun removeMarker(id: String) =
    onUi {
      markersById.remove(id)?.remove()
    }

  fun clearMarkers() =
    onUi {
      markersById.values.forEach { it.remove() }
      markersById.clear()
      pendingMarkers.clear()
    }

  fun addPolyline(
    id: String,
    opts: PolylineOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingPolylines.add(id to opts)
      return@onUi
    }
    polylinesById.remove(id)?.remove()
    addPolylineInternal(id, opts)
  }

  private fun addPolylineInternal(
    id: String,
    opts: PolylineOptions,
  ) = onUi {
    val pl =
      googleMap?.addPolyline(opts).also {
        it?.tag = PolylineTag(id = id)
      }
    if (pl != null) polylinesById[id] = pl
  }

  fun updatePolyline(
    id: String,
    block: (Polyline) -> Unit,
  ) = onUi {
    val pl = polylinesById[id] ?: return@onUi
    block(pl)
  }

  fun removePolyline(id: String) =
    onUi {
      polylinesById.remove(id)?.remove()
    }

  fun clearPolylines() =
    onUi {
      polylinesById.values.forEach { it.remove() }
      polylinesById.clear()
      pendingPolylines.clear()
    }

  fun addPolygon(
    id: String,
    opts: PolygonOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingPolygons.add(id to opts)
      return@onUi
    }
    polygonsById.remove(id)?.remove()
    addPolygonInternal(id, opts)
  }

  private fun addPolygonInternal(
    id: String,
    opts: PolygonOptions,
  ) = onUi {
    val polygon =
      googleMap?.addPolygon(opts).also {
        it?.tag = PolygonTag(id = id)
      }
    if (polygon != null) polygonsById[id] = polygon
  }

  fun updatePolygon(
    id: String,
    block: (Polygon) -> Unit,
  ) = onUi {
    val polygon = polygonsById[id] ?: return@onUi
    block(polygon)
  }

  fun removePolygon(id: String) =
    onUi {
      polygonsById.remove(id)?.remove()
    }

  fun clearPolygons() =
    onUi {
      polygonsById.values.forEach { it.remove() }
      polygonsById.clear()
      pendingPolygons.clear()
    }

  fun addCircle(
    id: String,
    opts: CircleOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingCircles.add(id to opts)
      return@onUi
    }
    circlesById.remove(id)?.remove()
    addCircleInternal(id, opts)
  }

  private fun addCircleInternal(
    id: String,
    opts: CircleOptions,
  ) = onUi {
    val circle =
      googleMap?.addCircle(opts).also {
        it?.tag = CircleTag(id = id)
      }
    if (circle != null) circlesById[id] = circle
  }

  fun updateCircle(
    id: String,
    block: (Circle) -> Unit,
  ) = onUi {
    val circle = circlesById[id] ?: return@onUi
    block(circle)
  }

  fun removeCircle(id: String) =
    onUi {
      circlesById.remove(id)?.remove()
    }

  fun clearCircles() =
    onUi {
      circlesById.values.forEach { it.remove() }
      circlesById.clear()
      pendingCircles.clear()
    }

  fun addHeatmap(
    id: String,
    opts: TileOverlayOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingHeatmaps.add(id to opts)
      return@onUi
    }
    heatmapsById.remove(id)?.remove()
    addHeatmapInternal(id, opts)
  }

  private fun addHeatmapInternal(
    id: String,
    opts: TileOverlayOptions,
  ) = onUi {
    val overlay = googleMap?.addTileOverlay(opts)
    if (overlay != null) heatmapsById[id] = overlay
  }

  fun removeHeatmap(id: String) =
    onUi {
      heatmapsById.remove(id)?.let { heatMap ->
        heatMap.clearTileCache()
        heatMap.remove()
      }
    }

  fun clearHeatmaps() =
    onUi {
      heatmapsById.values.forEach {
        it.clearTileCache()
        it.remove()
      }
      heatmapsById.clear()
      pendingHeatmaps.clear()
    }

  fun addKmlLayer(
    id: String,
    kmlString: String,
  ) = onUi {
    if (googleMap == null) {
      pendingKmlLayers.add(id to kmlString)
      return@onUi
    }
    kmlLayersById.remove(id)?.removeLayerFromMap()
    addKmlLayerInternal(id, kmlString)
  }

  private fun addKmlLayerInternal(
    id: String,
    kmlString: String,
  ) = onUi {
    try {
      val inputStream = ByteArrayInputStream(kmlString.toByteArray(StandardCharsets.UTF_8))
      val layer = KmlLayer(googleMap, inputStream, context)
      kmlLayersById[id] = layer
      layer.addLayerToMap()
    } catch (_: Exception) {
      mapsLog("kml layer parse failed: id=$id")
    }
  }

  fun removeKmlLayer(id: String) =
    onUi {
      kmlLayersById.remove(id)?.removeLayerFromMap()
    }

  fun clearKmlLayer() =
    onUi {
      kmlLayersById.values.forEach { it.removeLayerFromMap() }
      kmlLayersById.clear()
      pendingKmlLayers.clear()
    }

  fun addUrlTileOverlay(
    id: String,
    opts: TileOverlayOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingUrlTilesOverlays.add(id to opts)
      return@onUi
    }
    urlTileOverlaysById.remove(id)?.remove()
    addUrlTileOverlayInternal(id, opts)
  }

  private fun addUrlTileOverlayInternal(
    id: String,
    opts: TileOverlayOptions,
  ) = onUi {
    val overlay = googleMap?.addTileOverlay(opts)
    if (overlay != null) urlTileOverlaysById[id] = overlay
  }

  fun removeUrlTileOverlay(id: String) =
    onUi {
      urlTileOverlaysById.remove(id)?.let { urlTileOverlay ->
        urlTileOverlay.clearTileCache()
        urlTileOverlay.remove()
      }
    }

  fun clearUrlTileOverlays() =
    onUi {
      urlTileOverlaysById.values.forEach {
        it.clearTileCache()
        it.remove()
      }
      urlTileOverlaysById.clear()
      pendingUrlTilesOverlays.clear()
    }

  fun destroyInternal() =
    onUi {
      if (destroyed) return@onUi
      destroyed = true
      lifecycleObserver?.toDestroyedState()
      markerBuilder.cancelAllJobs()
      clearMarkers()
      clearPolylines()
      clearPolygons()
      clearCircles()
      clearHeatmaps()
      clearKmlLayer()
      clearUrlTileOverlays()
      googleMap?.apply {
        setOnCameraMoveStartedListener(null)
        setOnCameraMoveListener(null)
        setOnCameraIdleListener(null)
        setOnMarkerClickListener(null)
        setOnPolylineClickListener(null)
        setOnPolygonClickListener(null)
        setOnCircleClickListener(null)
        setOnMapClickListener(null)
        setOnMapLongClickListener(null)
        setOnPoiClickListener(null)
        setOnMarkerDragListener(null)
        setOnInfoWindowClickListener(null)
        setOnInfoWindowCloseListener(null)
        setOnInfoWindowLongClickListener(null)
        setOnMyLocationClickListener(null)
        setOnMyLocationButtonClickListener(null)
        setInfoWindowAdapter(null)
        isTrafficEnabled = false
        isIndoorEnabled = false
        myLocationEnabled = false
        setLocationSource(null)
        setLatLngBoundsForCameraTarget(null)
      }
      googleMap = null
      mapView?.removeAllViews()
      mapView = null
      super.removeAllViews()
      reactContext.unregisterComponentCallbacks(componentCallbacks)
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
    initMapView()
    lifecycle = mapView?.findViewTreeLifecycleOwner()?.lifecycle
    lifecycleObserver?.let { observer ->
      lifecycle?.addObserver(observer)
    }
  }

  override fun onDetachedFromWindow() {
    lifecycleObserver?.let { lifecycle?.removeObserver(it) }
    lifecycle = null
    super.onDetachedFromWindow()
  }

  override fun onMarkerClick(marker: Marker): Boolean {
    onUi {
      onMarkerPress?.invoke(marker.idTag)
    }
    return uiSettings?.consumeOnMarkerPress ?: false
  }

  override fun onPolylineClick(polyline: Polyline) =
    onUi {
      onPolylinePress?.invoke(polyline.idTag)
    }

  override fun onPolygonClick(polygon: Polygon) =
    onUi {
      onPolygonPress?.invoke(polygon.idTag)
    }

  override fun onCircleClick(circle: Circle) =
    onUi {
      onCirclePress?.invoke(circle.idTag)
    }

  override fun onMapClick(coordinates: LatLng) =
    onUi {
      onMapPress?.invoke(coordinates.toRnLatLng())
    }

  override fun onMapLongClick(coordinates: LatLng) =
    onUi {
      onMapLongPress?.invoke(coordinates.toRnLatLng())
    }

  override fun onMarkerDragStart(marker: Marker) =
    onUi {
      onMarkerDragStart?.invoke(marker.idTag, marker.position.toRnLatLng())
    }

  override fun onMarkerDrag(marker: Marker) =
    onUi {
      onMarkerDrag?.invoke(marker.idTag, marker.position.toRnLatLng())
    }

  override fun onMarkerDragEnd(marker: Marker) =
    onUi {
      onMarkerDragEnd?.invoke(marker.idTag, marker.position.toRnLatLng())
    }

  override fun onIndoorBuildingFocused() =
    onUi {
      val building = googleMap?.focusedBuilding ?: return@onUi
      onIndoorBuildingFocused?.invoke(building.toRNIndoorBuilding())
    }

  override fun onIndoorLevelActivated(indoorBuilding: IndoorBuilding) =
    onUi {
      val activeLevel =
        indoorBuilding.levels.getOrNull(indoorBuilding.activeLevelIndex) ?: return@onUi
      onIndoorLevelActivated?.invoke(
        activeLevel.toRNIndoorLevel(indoorBuilding.activeLevelIndex, true),
      )
    }

  override fun onPoiClick(poi: PointOfInterest) =
    onUi {
      onPoiPress?.invoke(poi.placeId, poi.name, poi.latLng.toRnLatLng())
    }

  override fun onInfoWindowClick(marker: Marker) =
    onUi {
      onInfoWindowPress?.invoke(marker.idTag)
    }

  override fun onInfoWindowClose(marker: Marker) =
    onUi {
      onInfoWindowClose?.invoke(marker.idTag)
    }

  override fun onInfoWindowLongClick(marker: Marker) =
    onUi {
      onInfoWindowLongPress?.invoke(marker.idTag)
    }

  override fun onMyLocationClick(location: Location) =
    onUi {
      onMyLocationPress?.invoke(location.toRnLocation())
    }

  override fun onMyLocationButtonClick(): Boolean {
    onUi {
      onMyLocationButtonPress?.invoke(true)
    }
    return uiSettings?.consumeOnMyLocationButtonPress ?: false
  }

  override fun getInfoContents(marker: Marker): View? = null

  override fun getInfoWindow(marker: Marker): View? = markerBuilder.buildInfoWindow(marker.tagData)
}
