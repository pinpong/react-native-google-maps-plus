package com.rngooglemapsplus

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.gms.maps.model.MapStyleOptions
import com.margelo.nitro.core.Promise
import com.rngooglemapsplus.extensions.circleEquals
import com.rngooglemapsplus.extensions.markerEquals
import com.rngooglemapsplus.extensions.polygonEquals
import com.rngooglemapsplus.extensions.polylineEquals
import com.rngooglemapsplus.extensions.toCameraPosition
import com.rngooglemapsplus.extensions.toMapColorScheme

@DoNotStrip
class RNGoogleMapsPlusView(
  val context: ThemedReactContext,
) : HybridRNGoogleMapsPlusViewSpec() {
  private var currentCustomMapStyle: String? = null
  private var permissionHandler = PermissionHandler(context)
  private var locationHandler = LocationHandler(context)
  private var playServiceHandler = PlayServicesHandler(context)

  private val markerBuilder = MapMarkerBuilder()
  private val polylineBuilder = MapPolylineBuilder()
  private val polygonBuilder = MapPolygonBuilder()
  private val circleBuilder = MapCircleBuilder()
  private val heatmapBuilder = MapHeatmapBuilder()

  override val view =
    GoogleMapsViewImpl(context, locationHandler, playServiceHandler, markerBuilder)

  override var initialProps: RNInitialProps? = null
    set(value) {
      if (field == value) return
      field = value
      view.initMapView(
        value?.mapId,
        value?.liteMode,
        value?.camera?.toCameraPosition(),
      )
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

  override var customMapStyle: String? = null
    set(value) {
      if (field == value) return
      field = value
      currentCustomMapStyle = value
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
      value?.let {
        view.mapType = it.value
      }
    }

  override var markers: Array<RNMarker>? = null
    set(value) {
      if (field.contentEquals(value)) return
      val prevById = field?.associateBy { it.id } ?: emptyMap()
      val nextById = value?.associateBy { it.id } ?: emptyMap()
      field = value

      (prevById.keys - nextById.keys).forEach { id ->
        markerBuilder.cancelIconJob(id)
        view.removeMarker(id)
      }

      nextById.forEach { (id, next) ->
        val prev = prevById[id]
        if (prev == null) {
          markerBuilder.buildIconAsync(id, next) { icon ->
            view.addMarker(
              id,
              markerBuilder.build(next, icon),
            )
          }
        } else if (!prev.markerEquals(next)) {
          view.updateMarker(id) { marker ->
            onUi {
              markerBuilder.update(marker, next, prev)
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
        val prev = prevById[id]
        if (prev == null) {
          view.addPolyline(id, polylineBuilder.build(next))
        } else if (!prev.polylineEquals(next)) {
          view.updatePolyline(id) { polyline ->
            onUi {
              polylineBuilder.update(polyline, next)
            }
          }
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
        val prev = prevById[id]
        if (prev == null) {
          view.addPolygon(id, polygonBuilder.build(next))
        } else if (!prev.polygonEquals(next)) {
          view.updatePolygon(id) { polygon ->
            onUi { polygonBuilder.update(polygon, next) }
          }
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
        val prev = prevById[id]
        if (prev == null) {
          view.addCircle(id, circleBuilder.build(next))
        } else if (!prev.circleEquals(next)) {
          view.updateCircle(id) { circle ->
            onUi {
              circleBuilder.update(circle, next)
            }
          }
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
        view.addHeatmap(id, heatmapBuilder.build(next))
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
        view.addKmlLayer(id, next.kmlString)
      }
    }

  override var locationConfig: RNLocationConfig? = null
    set(value) {
      if (field == value) return
      field = value
      view.locationConfig = value
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

  override var onMarkerPress: ((String?) -> Unit)? = null
    set(cb) {
      view.onMarkerPress = cb
    }

  override var onPolylinePress: ((String?) -> Unit)? = null
    set(cb) {
      view.onPolylinePress = cb
    }

  override var onPolygonPress: ((String?) -> Unit)? = null
    set(cb) {
      view.onPolygonPress = cb
    }

  override var onCirclePress: ((String?) -> Unit)? = null
    set(cb) {
      view.onCirclePress = cb
    }

  override var onMarkerDragStart: ((String?, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDragStart = cb
    }

  override var onMarkerDrag: ((String?, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDrag = cb
    }

  override var onMarkerDragEnd: ((String?, RNLatLng) -> Unit)? = null
    set(cb) {
      view.onMarkerDragEnd = cb
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
    view.setCamera(camera.toCameraPosition(), animated == true, durationMS?.toInt() ?: 3000)
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
}

private inline fun onUi(crossinline block: () -> Unit) {
  if (UiThreadUtil.isOnUiThread()) {
    block()
  } else {
    UiThreadUtil.runOnUiThread { block() }
  }
}
