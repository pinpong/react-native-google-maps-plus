package com.rngooglemapsplus

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapColorScheme
import com.google.android.gms.maps.model.MapStyleOptions
import com.margelo.nitro.core.Promise

@DoNotStrip
class RNGoogleMapsPlusView(
  val context: ThemedReactContext,
) : HybridRNGoogleMapsPlusViewSpec() {
  private var currentCustomMapStyle: String? = null
  private var permissionHandler = PermissionHandler(context)
  private var locationHandler = LocationHandler(context)
  private var playServiceHandler = PlayServicesHandler(context)

  private val markerOptions = MarkerOptions()
  private val polylineOptions = MapPolylineOptions()
  private val polygonOptions = MapPolygonOptions()
  private val circleOptions = MapCircleOptions()

  override val view =
    GoogleMapsViewImpl(context, locationHandler, playServiceHandler, markerOptions)

  override var initialProps: RNInitialProps? = null
    set(value) {
      view.initMapView(
        value?.mapId,
        value?.liteMode,
        mapCameraToCameraPosition(value?.initialCamera),
      )
    }

  override var buildingEnabled: Boolean? = null
    set(value) {
      view.buildingEnabled = value
    }

  override var trafficEnabled: Boolean? = null
    set(value) {
      view.trafficEnabled = value
    }

  override var customMapStyle: String? = null
    set(value) {
      currentCustomMapStyle = value
      value?.let {
        view.customMapStyle = MapStyleOptions(it)
      }
    }

  override var userInterfaceStyle: RNUserInterfaceStyle? = null
    set(value) {
      view.userInterfaceStyle = userInterfaceStyleToMapColorScheme(value)
    }

  override var minZoomLevel: Double? = null
    set(value) {
      view.minZoomLevel = value
    }

  override var maxZoomLevel: Double? = null
    set(value) {
      view.maxZoomLevel = value
    }

  override var mapPadding: RNMapPadding? = null
    set(value) {
      view.mapPadding = value
    }

  override var mapType: RNMapType? = null
    set(value) {
      value?.let {
        view.mapType = it.value
      }
    }

  override var markers: Array<RNMarker>? = null
    set(value) {
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()

      (prevById.keys - nextById.keys).forEach { id ->
        markerOptions.cancelIconJob(id)
        view.removeMarker(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        if (prev == null) {
          markerOptions.buildIconAsync(id, next) { icon ->
            view.addMarker(
              id,
              markerOptions.build(next, icon),
            )
          }
        } else if (!prev.markerEquals(next)) {
          view.updateMarker(id) { m ->
            onUi {
              m.position =
                LatLng(
                  next.coordinate.latitude,
                  next.coordinate.longitude,
                )
              next.zIndex?.let { m.zIndex = it.toFloat() } ?: run {
                m.zIndex = 0f
              }

              if (!prev.markerStyleEquals(next)) {
                markerOptions.buildIconAsync(id, next) { icon ->
                  m.setIcon(icon)
                }
              }
              m.setAnchor(
                (next.anchor?.x ?: 0.5).toFloat(),
                (next.anchor?.y ?: 0.5).toFloat(),
              )
            }
          }
        }
      }
      field = value
    }

  override var polylines: Array<RNPolyline>? = null
    set(value) {
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()

      (prevById.keys - nextById.keys).forEach { id ->
        view.removePolyline(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        if (prev == null) {
          view.addPolyline(id, polylineOptions.buildPolylineOptions(next))
        } else if (!prev.polylineEquals(next)) {
          view.updatePolyline(id) { gms ->
            onUi {
              gms.points =
                next.coordinates.map {

                  LatLng(it.latitude, it.longitude)
                }
              next.width?.let { gms.width = it.dpToPx() }
              next.lineCap?.let {
                val cap = polylineOptions.mapLineCap(it)
                gms.startCap = cap
                gms.endCap = cap
              }
              next.lineJoin?.let { gms.jointType = polylineOptions.mapLineJoin(it) }
              next.color?.let { gms.color = it.toColor() }
              next.zIndex?.let { gms.zIndex = it.toFloat() }
            }
          }
        }
      }
      field = value
    }

  override var polygons: Array<RNPolygon>? = null
    set(value) {
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()

      (prevById.keys - nextById.keys).forEach { id ->
        view.removePolygon(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        if (prev == null) {
          view.addPolygon(id, polygonOptions.buildPolygonOptions(next))
        } else if (!prev.polygonEquals(next)) {
          view.updatePolygon(id) { gmsPoly ->
            onUi {
              gmsPoly.points =
                next.coordinates.map {
                  com.google.android.gms.maps.model
                    .LatLng(it.latitude, it.longitude)
                }
              next.fillColor?.let { gmsPoly.fillColor = it.toColor() }
              next.strokeColor?.let { gmsPoly.strokeColor = it.toColor() }
              next.strokeWidth?.let { gmsPoly.strokeWidth = it.dpToPx() }
              next.zIndex?.let { gmsPoly.zIndex = it.toFloat() }
            }
          }
        }
      }
      field = value
    }

  override var circles: Array<RNCircle>? = null
    set(value) {
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()

      (prevById.keys - nextById.keys).forEach { id ->
        view.removeCircle(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        if (prev == null) {
          view.addCircle(id, circleOptions.buildCircleOptions(next))
        } else if (!prev.circleEquals(next)) {
          view.updateCircle(id) { gmsCircle ->
            onUi {
              gmsCircle.center = LatLng(next.center.latitude, next.center.longitude)
              next.radius?.let { gmsCircle.radius = it }
              next.strokeWidth?.let { gmsCircle.strokeWidth = it.dpToPx() }
              next.strokeColor?.let { gmsCircle.strokeColor = it.toColor() }
              next.fillColor?.let { gmsCircle.fillColor = it.toColor() }
              next.zIndex?.let { gmsCircle.zIndex = it.toFloat() } ?: run { gmsCircle.zIndex = 0f }
            }
          }
        }
      }
      field = value
    }

  override var onMapError: ((RNMapErrorCode) -> Unit)? = null
    set(cb) {
      view.onMapError = cb
    }

  override var onMapReady: ((Boolean) -> Unit)? = null
    set(cb) {
      view.onMapReady = cb
    }
  override var onLocationUpdate: ((RNLocation) -> Unit)? = null
    set(cb) {
      view.onLocationUpdate = cb
    }

  override var onLocationError: ((RNLocationErrorCode) -> Unit)? = null
    set(cb) {
      view.onLocationError = cb
    }

  override var onMapPress: ((RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMapPress = cb
    }

  override var onMarkerPress: ((String) -> Unit)? = null
    set(cb) {
      view.onMarkerPress = cb
    }

  override var onPolylinePress: ((String) -> Unit)? = null
    set(cb) {
      view.onPolylinePress = cb
    }

  override var onPolygonPress: ((String) -> Unit)? = null
    set(cb) {
      view.onPolygonPress = cb
    }

  override var onCirclePress: ((String) -> Unit)? = null
    set(cb) {
      view.onCirclePress = cb
    }

  override var onCameraChangeStart: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
    set(cb) {
      view.onCameraChangeStart = cb
    }

  override var onCameraChange: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
    set(cb) {
      view.onCameraChange = cb
    }

  override var onCameraChangeComplete: ((RNRegion, RNCamera, Boolean) -> Unit)? = null
    set(cb) {
      view.onCameraChangeComplete = cb
    }

  override fun setCamera(
    camera: RNCamera,
    animated: Boolean?,
    durationMS: Double?,
  ) {
    view.setCamera(camera, animated == true, durationMS?.toInt() ?: 3000)
  }

  override fun setCameraToCoordinates(
    coordinates: Array<RNLatLng>,
    padding: RNMapPadding?,
    animated: Boolean?,
    durationMS: Double?,
  ) {
    view.setCameraToCoordinates(
      coordinates,
      padding = padding ?: RNMapPadding(0.0, 0.0, 0.0, 0.0),
      animated == true,
      durationMS?.toInt() ?: 3000,
    )
  }

  override fun showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  override fun openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  override fun requestLocationPermission(): Promise<RNLocationPermissionResult> = permissionHandler.requestLocationPermission()

  override fun isGooglePlayServicesAvailable(): Boolean = playServiceHandler.isPlayServicesAvailable()

  fun userInterfaceStyleToMapColorScheme(value: RNUserInterfaceStyle?): Int? {
    value ?: return null
    return when (value) {
      RNUserInterfaceStyle.LIGHT -> {
        MapColorScheme.LIGHT
      }

      RNUserInterfaceStyle.DARK -> {
        MapColorScheme.DARK
      }

      RNUserInterfaceStyle.DEFAULT -> {
        MapColorScheme.FOLLOW_SYSTEM
      }
    }
  }

  fun mapCameraToCameraPosition(camera: RNCamera?): CameraPosition? {
    camera ?: return null
    val builder = CameraPosition.builder()
    camera.center?.let {
      builder.target(
        com.google.android.gms.maps.model.LatLng(
          camera.center.latitude,
          camera.center.longitude,
        ),
      )
    }
    camera.zoom?.let { builder.zoom(it.toFloat()) }
    camera.bearing?.let { builder.bearing(it.toFloat()) }
    camera.tilt?.let { builder.tilt(it.toFloat()) }

    return builder.build()
  }
}

private inline fun onUi(crossinline block: () -> Unit) {
  if (UiThreadUtil.isOnUiThread()) {
    block()
  } else {
    UiThreadUtil.runOnUiThread { block() }
  }
}
