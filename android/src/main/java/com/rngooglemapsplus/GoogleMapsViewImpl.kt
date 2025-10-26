package com.rngooglemapsplus

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.location.Location
import android.util.Base64
import android.util.Size
import android.widget.FrameLayout
import androidx.core.graphics.scale
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.GoogleMapOptions
import com.google.android.gms.maps.MapView
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
import com.rngooglemapsplus.extensions.onUi
import com.rngooglemapsplus.extensions.onUiSync
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
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
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
  LifecycleEventListener {
  private var initialized = false
  private var loaded = false
  private var destroyed = false
  private var googleMap: GoogleMap? = null
  private var mapView: MapView? = null

  private val pendingMarkers = mutableListOf<Pair<String, MarkerOptions>>()
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

  init {
    reactContext.addLifecycleEventListener(this)
  }

  fun initMapView(googleMapsOptions: GoogleMapOptions) =
    onUi {
      if (initialized) return@onUi
      initialized = true

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

      mapView = MapView(reactContext, googleMapsOptions)
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
          googleMap?.setOnMapLongClickListener(this@GoogleMapsViewImpl)
          googleMap?.setOnPoiClickListener(this@GoogleMapsViewImpl)
          googleMap?.setOnMarkerDragListener(this@GoogleMapsViewImpl)
          googleMap?.setOnInfoWindowClickListener(this@GoogleMapsViewImpl)
          googleMap?.setOnInfoWindowCloseListener(this@GoogleMapsViewImpl)
          googleMap?.setOnInfoWindowLongClickListener(this@GoogleMapsViewImpl)
          googleMap?.setOnMyLocationClickListener(this@GoogleMapsViewImpl)
          googleMap?.setOnMyLocationButtonClickListener(this@GoogleMapsViewImpl)
          loaded = true
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

  override fun onCameraMoveStarted(reason: Int) =
    onUi {
      if (!loaded) return@onUi
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
      if (!loaded) return@onUi
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
      if (!loaded) return@onUi
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
    locationHandler.start()
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
      pendingMarkers.forEach { (id, opts) -> internalAddMarker(id, opts) }
      pendingMarkers.clear()
    }
    if (pendingPolylines.isNotEmpty()) {
      pendingPolylines.forEach { (id, opts) -> internalAddPolyline(id, opts) }
      pendingPolylines.clear()
    }
    if (pendingPolygons.isNotEmpty()) {
      pendingPolygons.forEach { (id, opts) -> internalAddPolygon(id, opts) }
      pendingPolygons.clear()
    }
    if (pendingCircles.isNotEmpty()) {
      pendingCircles.forEach { (id, opts) -> internalAddCircle(id, opts) }
      pendingCircles.clear()
    }
    if (pendingHeatmaps.isNotEmpty()) {
      pendingHeatmaps.forEach { (id, opts) -> internalAddHeatmap(id, opts) }
      pendingHeatmaps.clear()
    }
    if (pendingKmlLayers.isNotEmpty()) {
      pendingKmlLayers.forEach { (id, str) -> internalAddKmlLayer(id, str) }
      pendingKmlLayers.clear()
    }
    if (pendingUrlTilesOverlays.isNotEmpty()) {
      pendingUrlTilesOverlays.forEach { (id, opts) -> internalAddUrlTileOverlay(id, opts) }
      pendingUrlTilesOverlays.clear()
    }
  }

  val currentCamera: CameraPosition?
    get() = onUiSync { googleMap?.cameraPosition }

  var initialProps: RNInitialProps? = null

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
      onUi { googleMap?.mapColorScheme = value ?: MapColorScheme.FOLLOW_SYSTEM }
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
  var onMarkerPress: ((String?) -> Unit)? = null
  var onPolylinePress: ((String?) -> Unit)? = null
  var onPolygonPress: ((String?) -> Unit)? = null
  var onCirclePress: ((String?) -> Unit)? = null
  var onMarkerDragStart: ((String?, RNLatLng) -> Unit)? = null
  var onMarkerDrag: ((String?, RNLatLng) -> Unit)? = null
  var onMarkerDragEnd: ((String?, RNLatLng) -> Unit)? = null
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Unit)? = null
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Unit)? = null
  var onInfoWindowPress: ((String?) -> Unit)? = null
  var onInfoWindowClose: ((String?) -> Unit)? = null
  var onInfoWindowLongPress: ((String?) -> Unit)? = null
  var onMyLocationPress: ((RNLocation) -> Unit)? = null
  var onMyLocationButtonPress: ((Boolean) -> Unit)? = null
  var onCameraChangeStart: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChange: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
  var onCameraChangeComplete: ((RNRegion, RNCamera, Boolean) -> Unit)? = null

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
    val builder = LatLngBounds.Builder()
    coordinates.forEach { coord -> builder.include(coord.toLatLng()) }
    val bounds = builder.build()

    val latSpan = bounds.northeast.latitude - bounds.southwest.latitude
    val lngSpan = bounds.northeast.longitude - bounds.southwest.longitude

    val h = (mapView?.height ?: 0)
    val w = (mapView?.width ?: 0)
    val latPerPixel = if (h != 0) latSpan / h else 0.0
    val lngPerPixel = if (w != 0) lngSpan / w else 0.0

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
      (w - padding.left.dpToPx() - padding.right.dpToPx()).toInt().coerceAtLeast(0)
    val adjustedHeight =
      (h - padding.top.dpToPx() - padding.bottom.dpToPx()).toInt().coerceAtLeast(0)

    val update =
      CameraUpdateFactory.newLatLngBounds(
        paddedBounds,
        adjustedWidth,
        adjustedHeight,
        0,
      )
    if (animated) {
      googleMap?.animateCamera(update, durationMs, null)
    } else {
      googleMap?.moveCamera(update)
    }
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
        try {
          if (bitmap == null) {
            promise.resolve(null)
            return@snapshot
          }
          val scaledBitmap = size?.let { bitmap.scale(it.width, it.height) } ?: bitmap
          val output = ByteArrayOutputStream()
          scaledBitmap.compress(compressFormat, (quality * 100).toInt().coerceIn(0, 100), output)
          val bytes = output.toByteArray()

          if (resultIsFile) {
            val file = File(context.cacheDir, "map_snapshot_${System.currentTimeMillis()}.$format")
            FileOutputStream(file).use { it.write(bytes) }
            promise.resolve(file.absolutePath)
          } else {
            val base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
            promise.resolve("data:image/$format;base64,$base64")
          }

          if (scaledBitmap !== bitmap) scaledBitmap.recycle()
          bitmap.recycle()
        } catch (_: Exception) {
          promise.resolve(null)
        }
      }
    }
    return promise
  }

  fun addMarker(
    id: String,
    opts: MarkerOptions,
  ) = onUi {
    if (googleMap == null) {
      pendingMarkers.add(id to opts)
      return@onUi
    }
    markersById.remove(id)?.remove()
    internalAddMarker(id, opts)
  }

  private fun internalAddMarker(
    id: String,
    opts: MarkerOptions,
  ) = onUi {
    val marker = googleMap?.addMarker(opts).also { it?.tag = id }
    if (marker != null) markersById[id] = marker
  }

  fun updateMarker(
    id: String,
    block: (Marker) -> Unit,
  ) = onUi {
    val marker = markersById[id] ?: return@onUi
    block(marker)
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
    internalAddPolyline(id, opts)
  }

  private fun internalAddPolyline(
    id: String,
    opts: PolylineOptions,
  ) = onUi {
    val pl = googleMap?.addPolyline(opts).also { it?.tag = id }
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
    internalAddPolygon(id, opts)
  }

  private fun internalAddPolygon(
    id: String,
    opts: PolygonOptions,
  ) = onUi {
    val polygon = googleMap?.addPolygon(opts).also { it?.tag = id }
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
    internalAddCircle(id, opts)
  }

  private fun internalAddCircle(
    id: String,
    opts: CircleOptions,
  ) = onUi {
    val circle = googleMap?.addCircle(opts).also { it?.tag = id }
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
    internalAddHeatmap(id, opts)
  }

  private fun internalAddHeatmap(
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
      heatmapsById.values.forEach { it.remove() }
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
    internalAddKmlLayer(id, kmlString)
  }

  private fun internalAddKmlLayer(
    id: String,
    kmlString: String,
  ) = onUi {
    try {
      val inputStream = ByteArrayInputStream(kmlString.toByteArray(StandardCharsets.UTF_8))
      val layer = KmlLayer(googleMap, inputStream, context)
      kmlLayersById[id] = layer
      layer.addLayerToMap()
    } catch (_: Exception) {
      // ignore
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
    internalAddUrlTileOverlay(id, opts)
  }

  private fun internalAddUrlTileOverlay(
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
      urlTileOverlaysById.values.forEach { it.remove() }
      urlTileOverlaysById.clear()
      pendingUrlTilesOverlays.clear()
    }

  fun destroyInternal() =
    onUi {
      if (destroyed) return@onUi
      destroyed = true
      locationHandler.stop()
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
      initialized = false
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

  override fun onAttachedToWindow() =
    onUi {
      super.onAttachedToWindow()
      locationHandler.start()
    }

  override fun onDetachedFromWindow() =
    onUi {
      super.onDetachedFromWindow()
      locationHandler.stop()
    }

  override fun onHostResume() =
    onUi {
      locationHandler.start()
      mapView?.onResume()
    }

  override fun onHostPause() =
    onUi {
      locationHandler.stop()
      mapView?.onPause()
    }

  override fun onHostDestroy() {
    destroyInternal()
  }

  override fun onMarkerClick(marker: Marker): Boolean {
    onUi {
      marker.showInfoWindow()
      onMarkerPress?.invoke(marker.tag?.toString())
    }
    return uiSettings?.consumeOnMarkerPress ?: false
  }

  override fun onPolylineClick(polyline: Polyline) =
    onUi {
      onPolylinePress?.invoke(polyline.tag?.toString())
    }

  override fun onPolygonClick(polygon: Polygon) =
    onUi {
      onPolygonPress?.invoke(polygon.tag?.toString())
    }

  override fun onCircleClick(circle: Circle) =
    onUi {
      onCirclePress?.invoke(circle.tag?.toString())
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
      onMarkerDragStart?.invoke(marker.tag?.toString(), marker.position.toRnLatLng())
    }

  override fun onMarkerDrag(marker: Marker) =
    onUi {
      onMarkerDrag?.invoke(marker.tag?.toString(), marker.position.toRnLatLng())
    }

  override fun onMarkerDragEnd(marker: Marker) =
    onUi {
      onMarkerDragEnd?.invoke(marker.tag?.toString(), marker.position.toRnLatLng())
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
      onInfoWindowPress?.invoke(marker.tag?.toString())
    }

  override fun onInfoWindowClose(marker: Marker) =
    onUi {
      onInfoWindowClose?.invoke(marker.tag?.toString())
    }

  override fun onInfoWindowLongClick(marker: Marker) =
    onUi {
      onInfoWindowLongPress?.invoke(marker.tag?.toString())
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
}
