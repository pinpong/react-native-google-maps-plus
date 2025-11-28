import CoreLocation
import Foundation
import GoogleMaps
import NitroModules

final class RNGoogleMapsPlusView: HybridRNGoogleMapsPlusViewSpec {

  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler

  private let markerBuilder = MapMarkerBuilder()
  private let polylineBuilder = MapPolylineBuilder()
  private let polygonBuilder = MapPolygonBuilder()
  private let circleBuilder = MapCircleBuilder()
  private let heatmapBuilder = MapHeatmapBuilder()
  private let urlTileOverlayBuilder = MapUrlTileOverlayBuilder()

  private let impl: GoogleMapsViewImpl

  var view: UIView {
    return impl
  }

  override init() {
    self.permissionHandler = PermissionHandler()
    self.locationHandler = LocationHandler()
    self.impl = GoogleMapsViewImpl(
      locationHandler: locationHandler,
      markerBuilder: markerBuilder
    )
  }

  func dispose() {
    impl.deinitInternal()
  }

  var initialProps: RNInitialProps? {
    didSet {
      let options = GMSMapViewOptions()
      initialProps?.mapId.map { options.mapID = GMSMapID(identifier: $0) }
      initialProps?.liteMode.map { _ in /* not supported */ }
      initialProps?.camera.map {
        options.camera = $0.toGMSCameraPosition(current: nil)
      }
      initialProps?.backgroundColor.map {
        options.backgroundColor = $0.toUIColor()
      }

      impl.googleMapOptions = options
    }
  }

  var uiSettings: RNMapUiSettings? {
    didSet { impl.uiSettings = uiSettings }
  }

  var myLocationEnabled: Bool? {
    didSet { impl.myLocationEnabled = myLocationEnabled }
  }

  var buildingEnabled: Bool? {
    didSet { impl.buildingEnabled = buildingEnabled }
  }

  var trafficEnabled: Bool? {
    didSet { impl.trafficEnabled = trafficEnabled }
  }

  var indoorEnabled: Bool? {
    didSet { impl.indoorEnabled = indoorEnabled }
  }

  var customMapStyle: String? {
    didSet {
      if let value = customMapStyle {
        impl.customMapStyle = try? GMSMapStyle(jsonString: value)
      }
    }
  }

  var userInterfaceStyle: RNUserInterfaceStyle? {
    didSet {
      impl.userInterfaceStyle = userInterfaceStyle?.toUIUserInterfaceStyle
    }
  }

  var mapZoomConfig: RNMapZoomConfig? {
    didSet { impl.mapZoomConfig = mapZoomConfig }
  }

  var mapPadding: RNMapPadding? {
    didSet { impl.mapPadding = mapPadding }
  }

  var mapType: RNMapType? {
    didSet {
      impl.mapType = mapType?.toGMSMapViewType
    }
  }

  var markers: [RNMarker]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (markers ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)

      removed.forEach {
        self.impl.removeMarker(id: $0)
        self.markerBuilder.cancelIconTask($0)
      }

      for (id, next) in nextById {
        if let prev = prevById[id] {
          if !prev.markerEquals(next) {
            self.impl.updateMarker(id: id) { [weak self] m in
              guard let self else { return }
              self.markerBuilder.update(prev, next, m)
            }
          }
        } else {
          self.markerBuilder.buildIconAsync(next) { [weak self] icon in
            guard let self else { return }
            let marker = self.markerBuilder.build(next, icon: icon)
            self.impl.addMarker(id: id, marker: marker)
          }
        }
      }
    }
  }

  var polylines: [RNPolyline]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (polylines ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removePolyline(id: $0) }

      for (id, next) in nextById {
        if let prev = prevById[id] {
          if !prev.polylineEquals(next) {
            impl.updatePolyline(id: id) { [weak self] pl in
              guard let self else { return }
              self.polylineBuilder.update(prev, next, pl)
            }
          }
        } else {
          impl.addPolyline(
            id: id,
            polyline: polylineBuilder.build(next)
          )
        }
      }
    }
  }

  var polygons: [RNPolygon]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (polygons ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removePolygon(id: $0) }

      for (id, next) in nextById {
        if let prev = prevById[id] {
          if !prev.polygonEquals(next) {
            impl.updatePolygon(id: id) { [weak self] pg in
              guard let self else { return }
              self.polygonBuilder.update(prev, next, pg)
            }
          }
        } else {
          impl.addPolygon(id: id, polygon: polygonBuilder.build(next))
        }
      }
    }
  }

  var circles: [RNCircle]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (circles ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removeCircle(id: $0) }

      for (id, next) in nextById {
        if let prev = prevById[id] {
          if !prev.circleEquals(next) {
            impl.updateCircle(id: id) { [weak self] circle in
              guard let self else { return }
              self.circleBuilder.update(prev, next, circle)
            }
          }
        } else {
          impl.addCircle(id: id, circle: circleBuilder.build(next))
        }
      }
    }
  }

  var heatmaps: [RNHeatmap]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (heatmaps ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removeHeatmap(id: $0) }

      for (id, next) in nextById {
        impl.addHeatmap(id: id, heatmap: heatmapBuilder.build(next))
      }
    }
  }

  var kmlLayers: [RNKMLayer]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (kmlLayers ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removeKmlLayer(id: $0) }

      for (id, next) in nextById {
        impl.addKmlLayer(id: id, kmlString: next.kmlString)
      }
    }
  }

  var urlTileOverlays: [RNUrlTileOverlay]? {
    didSet {
      let prevById = Dictionary(
        (oldValue ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        (urlTileOverlays ?? []).map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removeUrlTileOverlay(id: $0) }

      for (id, next) in nextById {
        impl.addUrlTileOverlay(
          id: id,
          urlTileOverlay: urlTileOverlayBuilder.build(next)
        )
      }
    }
  }

  var locationConfig: RNLocationConfig? {
    didSet {
      impl.locationConfig = locationConfig
    }
  }

  var onMapError: ((RNMapErrorCode) -> Void)? {
    didSet { impl.onMapError = onMapError }
  }
  var onMapReady: ((Bool) -> Void)? {
    didSet { impl.onMapReady = onMapReady }
  }
  var onMapLoaded: ((RNRegion, RNCamera) -> Void)? {
    didSet { impl.onMapLoaded = onMapLoaded }
  }
  var onLocationUpdate: ((RNLocation) -> Void)? {
    didSet { impl.onLocationUpdate = onLocationUpdate }
  }
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)? {
    didSet { impl.onLocationError = onLocationError }
  }
  var onMapPress: ((RNLatLng) -> Void)? {
    didSet { impl.onMapPress = onMapPress }
  }
  var onMapLongPress: ((RNLatLng) -> Void)? {
    didSet { impl.onMapLongPress = onMapLongPress }
  }
  var onPoiPress: ((String, String, RNLatLng) -> Void)? {
    didSet { impl.onPoiPress = onPoiPress }
  }
  var onMarkerPress: ((String) -> Void)? {
    didSet { impl.onMarkerPress = onMarkerPress }
  }
  var onPolylinePress: ((String) -> Void)? {
    didSet { impl.onPolylinePress = onPolylinePress }
  }
  var onPolygonPress: ((String) -> Void)? {
    didSet { impl.onPolygonPress = onPolygonPress }
  }
  var onCirclePress: ((String) -> Void)? {
    didSet { impl.onCirclePress = onCirclePress }
  }
  var onMarkerDragStart: ((String, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDragStart = onMarkerDragStart }
  }
  var onMarkerDrag: ((String, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDrag = onMarkerDrag }
  }
  var onMarkerDragEnd: ((String, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDragEnd = onMarkerDragEnd }
  }
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Void)? {
    didSet { impl.onIndoorBuildingFocused = onIndoorBuildingFocused }
  }
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Void)? {
    didSet { impl.onIndoorLevelActivated = onIndoorLevelActivated }
  }
  var onInfoWindowPress: ((String) -> Void)? {
    didSet { impl.onInfoWindowPress = onInfoWindowPress }
  }
  var onInfoWindowClose: ((String) -> Void)? {
    didSet { impl.onInfoWindowClose = onInfoWindowClose }
  }
  var onInfoWindowLongPress: ((String) -> Void)? {
    didSet { impl.onInfoWindowLongPress = onInfoWindowLongPress }
  }
  var onMyLocationPress: ((RNLocation) -> Void)? {
    didSet { impl.onMyLocationPress = onMyLocationPress }
  }
  var onMyLocationButtonPress: ((Bool) -> Void)? {
    didSet { impl.onMyLocationButtonPress = onMyLocationButtonPress }
  }
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeStart = onCameraChangeStart }
  }
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChange = onCameraChange }
  }
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeComplete = onCameraChangeComplete }
  }

  func showMarkerInfoWindow(id: String) {
    impl.showMarkerInfoWindow(id: id)
  }

  func hideMarkerInfoWindow(id: String) {
    impl.hideMarkerInfoWindow(id: id)
  }

  func setCamera(camera: RNCameraUpdate, animated: Bool?, durationMs: Double?) {
    onMain {
      let cam = camera.toGMSCameraPosition(current: self.impl.currentCamera)
      self.impl.setCamera(
        camera: cam,
        animated: animated ?? true,
        durationMs: durationMs ?? 3000
      )
    }
  }

  func setCameraToCoordinates(
    coordinates: [RNLatLng],
    padding: RNMapPadding?,
    animated: Bool?,
    durationMs: Double?
  ) {
    impl.setCameraToCoordinates(
      coordinates: coordinates,
      padding: padding ?? RNMapPadding(0, 0, 0, 0),
      animated: animated ?? true,
      durationMs: durationMs ?? 3000
    )
  }

  func setCameraBounds(bounds: RNLatLngBounds?) {
    impl.setCameraBounds(bounds?.toCoordinateBounds())
  }

  func animateToBounds(
    bounds: RNLatLngBounds,
    padding: Double?,
    durationMs: Double?,
    lockBounds: Bool?
  ) {
    impl.animateToBounds(
      bounds.toCoordinateBounds(),
      padding: padding ?? 0,
      durationMs: durationMs ?? 3000,
      lockBounds: false
    )
  }

  func snapshot(
    options: RNSnapshotOptions,
  ) -> NitroModules.Promise<String?> {
    return impl.snapshot(
      size: options.size?.toCGSize(),
      format: options.format.toFileExtension(),
      imageFormat: options.format.toImageFormat(),
      quality: CGFloat(options.quality),
      resultIsFile: options.resultType.isFileResult()
    )

  }

  func showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  func openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  func requestLocationPermission()
  -> NitroModules.Promise<RNLocationPermissionResult> {
    return permissionHandler.requestLocationPermission()
  }

  func isGooglePlayServicesAvailable() -> Bool {
    /// not supported
    return false
  }
}
