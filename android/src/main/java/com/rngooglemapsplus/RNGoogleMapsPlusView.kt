package com.rngooglemapsplus

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.GoogleMapOptions
import com.google.android.gms.maps.model.MapStyleOptions
import com.margelo.nitro.core.Promise
import com.rngooglemapsplus.extensions.isFileResult
import com.rngooglemapsplus.extensions.toCameraPosition
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toCompressFormat
import com.rngooglemapsplus.extensions.toFileExtension
import com.rngooglemapsplus.extensions.toGoogleMapType
import com.rngooglemapsplus.extensions.toLatLngBounds
import com.rngooglemapsplus.extensions.toMapColorScheme
import com.rngooglemapsplus.extensions.toMarkerTag
import com.rngooglemapsplus.extensions.toSize

@DoNotStrip
class RNGoogleMapsPlusView(
  private val context: ThemedReactContext,
) : HybridRNGoogleMapsPlusViewSpec() {
  private val mapErrorHandler = MapErrorHandler()

  private val permissionHandler = PermissionHandler(context)
  private val locationHandler = LocationHandler(context)
  private val playServiceHandler = PlayServicesHandler(context)

  override val view =
    GoogleMapsViewImpl(context, locationHandler, playServiceHandler, mapErrorHandler)

  override fun onDropView() {
    view.destroyInternal()
  }

  override var initialProps: RNInitialProps? = null
    set(value) {
      if (field == value) return
      field = value

      val options =
        GoogleMapOptions().apply {
          initialProps?.mapId?.let { mapId(it) }
          initialProps?.liteMode?.let { liteMode(it) }
          initialProps?.camera?.let { camera(it.toCameraPosition(current = null)) }
          initialProps?.backgroundColor?.let { backgroundColor(it.toColor()) }
        }

      view.googleMapsOptions = options
    }

  override var uiSettings: RNMapUiSettings? = null
    set(value) {
      if (field == value) return
      field = value
      view.uiSettings = value
    }

  override var myLocationEnabled: Boolean? = null
    set(value) {
      if (field == value) return
      field = value
      view.myLocationEnabled = value
    }

  override var buildingEnabled: Boolean? = null
    set(value) {
      if (field == value) return
      field = value
      view.buildingEnabled = value
    }

  override var trafficEnabled: Boolean? = null
    set(value) {
      if (field == value) return
      field = value
      view.trafficEnabled = value
    }

  override var indoorEnabled: Boolean? = null
    set(value) {
      if (field == value) return
      field = value
      view.indoorEnabled = value
    }

  override var transitEnabled: Boolean? = null
    set(value) {
      if (field == value) return
      field = value
      view.transitEnabled = value
    }

  override var customMapStyle: String? = null
    set(value) {
      if (field == value) return
      field = value
      value?.let {
        view.customMapStyle = MapStyleOptions(it)
      }
    }

  override var userInterfaceStyle: RNUserInterfaceStyle? = null
    set(value) {
      if (field == value) return
      field = value
      view.userInterfaceStyle = value.toMapColorScheme()
    }

  override var mapZoomConfig: RNMapZoomConfig? = null
    set(value) {
      if (field == value) return
      field = value
      view.mapZoomConfig = value
    }

  override var mapPadding: RNMapPadding? = null
    set(value) {
      if (field == value) return
      field = value
      view.mapPadding = value
    }

  override var mapType: RNMapType? = null
    set(value) {
      if (field == value) return
      field = value
      view.mapType = value?.toGoogleMapType()
    }

  override var markers: Array<RNMarker>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value

      (prevById.keys - nextById.keys).forEach { id ->
        view.removeMarker(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        when {
          prev == null -> {
            markerBuilder.buildIconAsync(next) { icon, hitbox ->
              view.addMarker(
                id,
                markerBuilder.build(next, icon),
                next.toMarkerTag(hitbox),
              )
            }
          }

          !prev.markerEquals(next) -> {
            if (markerBuilder.hasIconJob(id)) {
              markerBuilder.buildIconAsync(next) { icon, hitbox ->
                view.addMarker(
                  id,
                  markerBuilder.build(next, icon),
                  next.toMarkerTag(hitbox),
                )
              }
            } else {
              view.updateMarker(id) { marker ->
                markerBuilder.update(prev, next, marker)
              }
            }
          }
        }
      }
    }

  override var polylines: Array<RNPolyline>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value
      (prevById.keys - nextById.keys).forEach { id ->
        view.removePolyline(id)
      }

      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addPolyline(next)
        } else {
          view.updatePolyline(next)
        }
      }
    }

  override var polygons: Array<RNPolygon>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value

      (prevById.keys - nextById.keys).forEach { id ->
        view.removePolygon(id)
      }

      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addPolygon(next)
        } else {
          view.updatePolygon(next)
        }
      }
    }

  override var circles: Array<RNCircle>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value

      (prevById.keys - nextById.keys).forEach { id ->
        view.removeCircle(id)
      }

      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addCircle(next)
        } else {
          view.updateCircle(next)
        }
      }
    }

  override var heatmaps: Array<RNHeatmap>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value
      (prevById.keys - nextById.keys).forEach { id ->
        view.removeHeatmap(id)
      }

      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addHeatmap(next)
        } else {
          view.updateHeatmap(next)
        }
      }
    }

  override var kmlLayers: Array<RNKMLayer>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value
      (prevById.keys - nextById.keys).forEach { id ->
        view.removeKmlLayer(id)
      }
      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addKmlLayer(next)
        } else {
          view.updateKmlLayer(next)
        }
      }
    }

  override var urlTileOverlays: Array<RNUrlTileOverlay>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value
      (prevById.keys - nextById.keys).forEach { id ->
        view.removeUrlTileOverlay(id)
      }

      nextById.forEach { (id, next) ->
        if (prevById[id] == null) {
          view.addUrlTileOverlay(next)
        } else {
          view.updateUrlTileOverlay(next)
        }
      }
    }

  override var locationConfig: RNLocationConfig? = null
    set(value) {
      if (field == value) return
      field = value
      view.locationConfig = value
    }

  override var onMapError: ((RNMapErrorCode, String) -> Unit)? = null
    set(cb) {
      field = cb
      mapErrorHandler.callback = cb
    }

  override var onMapReady: ((Boolean) -> Unit)? = null
    set(cb) {
      view.onMapReady = cb
    }

  override var onMapLoaded: ((RNRegion, RNCamera) -> Unit)? = null
    set(cb) {
      view.onMapLoaded = cb
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

  override var onMapLongPress: ((RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMapLongPress = cb
    }

  override var onMarkerPress: ((String) -> Unit)? = null
    set(cb) {
      view.onMarkerPress = cb
    }

  override var onPoiPress: ((String, String, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onPoiPress = cb
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

  override var onMarkerDragStart: ((String, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDragStart = cb
    }

  override var onMarkerDrag: ((String, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDrag = cb
    }

  override var onMarkerDragEnd: ((String, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDragEnd = cb
    }

  override var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Unit)? = null
    set(cb) {
      view.onIndoorBuildingFocused = cb
    }

  override var onIndoorLevelActivated: ((RNIndoorLevel) -> Unit)? = null
    set(cb) {
      view.onIndoorLevelActivated = cb
    }

  override var onInfoWindowPress: ((String) -> Unit)? = null
    set(cb) {
      view.onInfoWindowPress = cb
    }

  override var onInfoWindowClose: ((String) -> Unit)? = null
    set(cb) {
      view.onInfoWindowClose = cb
    }

  override var onInfoWindowLongPress: ((String) -> Unit)? = null
    set(cb) {
      view.onInfoWindowLongPress = cb
    }

  override var onMyLocationPress: ((RNLocation) -> Unit)? = null
    set(cb) {
      view.onMyLocationPress = cb
    }

  override var onMyLocationButtonPress: ((Boolean) -> Unit)? = null
    set(cb) {
      view.onMyLocationButtonPress = cb
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

  override fun showMarkerInfoWindow(id: String) {
    view.showMarkerInfoWindow(id)
  }

  override fun hideMarkerInfoWindow(id: String) {
    view.hideMarkerInfoWindow(id)
  }

  override fun clearMarkerIconCache() {
    view.clearMarkerIconCache()
  }

  override fun setCamera(
    camera: RNCameraUpdate,
    animated: Boolean?,
    durationMs: Double?,
  ) {
    val current = view.currentCamera
    view.setCamera(
      camera.toCameraPosition(current),
      animated ?: false,
      durationMs?.toInt() ?: 3000,
    )
  }

  override fun setCameraToCoordinates(
    coordinates: Array<RNLatLng>,
    padding: RNMapPadding?,
    animated: Boolean?,
    durationMs: Double?,
  ) {
    view.setCameraToCoordinates(
      coordinates,
      padding = padding ?: RNMapPadding(0.0, 0.0, 0.0, 0.0),
      animated ?: false,
      durationMs?.toInt() ?: 3000,
    )
  }

  override fun setCameraBounds(bounds: RNLatLngBounds?) {
    view.setCameraBounds(
      bounds?.toLatLngBounds(),
    )
  }

  override fun animateToBounds(
    bounds: RNLatLngBounds,
    padding: Double?,
    durationMs: Double?,
    lockBounds: Boolean?,
  ) {
    view.animateToBounds(
      bounds.toLatLngBounds(),
      padding = padding?.toInt() ?: 0,
      durationMs?.toInt() ?: 3000,
      lockBounds = lockBounds ?: false,
    )
  }

  override fun snapshot(options: RNSnapshotOptions): Promise<String?> =
    view.snapshot(
      size = options.size.toSize(),
      format = options.format.toFileExtension(),
      compressFormat = options.format.toCompressFormat(),
      quality = options.quality,
      resultIsFile = options.resultType.isFileResult(),
    )

  override fun showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  override fun openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  override fun requestLocationPermission(): Promise<RNLocationPermissionResult> = permissionHandler.requestLocationPermission()

  override fun isGooglePlayServicesAvailable(): Boolean = playServiceHandler.isPlayServicesAvailable()
}
