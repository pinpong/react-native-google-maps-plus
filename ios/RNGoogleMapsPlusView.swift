import CoreLocation
import Foundation
import GoogleMaps
import NitroModules

final class RNGoogleMapsPlusView: HybridRNGoogleMapsPlusViewSpec {

  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler

  private var propsInitialized = false
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

  @MainActor
  func afterUpdate() {
    if !propsInitialized {
      propsInitialized = true
      let options = GMSMapViewOptions()
      initialProps?.mapId.map { options.mapID = GMSMapID(identifier: $0) }
      initialProps?.liteMode.map { _ in /* not supported */ }
      initialProps?.camera.map {
        options.camera = $0.toGMSCameraPosition(current: nil)
      }
      impl.initMapView(googleMapOptions: options)
    }
  }

  @MainActor
  func dispose() {
    impl.deinitInternal()
  }

  @MainActor
  var initialProps: RNInitialProps? {
    didSet {
      impl.initialProps = initialProps
    }
  }

  @MainActor
  var uiSettings: RNMapUiSettings? {
    didSet { impl.uiSettings = uiSettings }
  }

  @MainActor
  var myLocationEnabled: Bool? {
    didSet { impl.myLocationEnabled = myLocationEnabled }
  }

  @MainActor
  var buildingEnabled: Bool? {
    didSet { impl.buildingEnabled = buildingEnabled }
  }

  @MainActor
  var trafficEnabled: Bool? {
    didSet { impl.trafficEnabled = trafficEnabled }
  }

  @MainActor
  var indoorEnabled: Bool? {
    didSet { impl.indoorEnabled = indoorEnabled }
  }

  @MainActor
  var customMapStyle: String? {
    didSet {
      if let value = customMapStyle {
        impl.customMapStyle = try? GMSMapStyle(jsonString: value)
      }
    }
  }

  @MainActor
  var userInterfaceStyle: RNUserInterfaceStyle? {
    didSet {
      impl.userInterfaceStyle = userInterfaceStyle?.toUIUserInterfaceStyle
    }
  }

  @MainActor
  var mapZoomConfig: RNMapZoomConfig? {
    didSet { impl.mapZoomConfig = mapZoomConfig }
  }

  @MainActor
  var mapPadding: RNMapPadding? {
    didSet { impl.mapPadding = mapPadding }
  }

  @MainActor
  var mapType: RNMapType? {
    didSet {
      impl.mapType = mapType?.toGMSMapViewType
    }
  }

  @MainActor
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
      withCATransaction(disableActions: true) {

        removed.forEach {
          self.impl.removeMarker(id: $0)
          self.markerBuilder.cancelIconTask($0)
        }

        for (id, next) in nextById {
          if let prev = prevById[id] {
            if !prev.markerEquals(next) {
              self.impl.updateMarker(id: id) { m in
                self.markerBuilder.update(prev, next, m)
              }
            }
          } else {
            self.markerBuilder.buildIconAsync(next.id, next) { icon in
              let marker = self.markerBuilder.build(next, icon: icon)
              self.impl.addMarker(id: id, marker: marker)
            }
          }
        }
      }
    }
  }

  @MainActor
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
            impl.updatePolyline(id: id) { pl in
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

  @MainActor
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
            impl.updatePolygon(id: id) { pg in
              self.polygonBuilder.update(prev, next, pg)
            }
          }
        } else {
          impl.addPolygon(id: id, polygon: polygonBuilder.build(next))
        }
      }
    }
  }

  @MainActor
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
            impl.updateCircle(id: id) { circle in
              self.circleBuilder.update(prev, next, circle)
            }
          }
        } else {
          impl.addCircle(id: id, circle: circleBuilder.build(next))
        }
      }
    }
  }

  @MainActor
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

  @MainActor
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

  @MainActor
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

  @MainActor
  var locationConfig: RNLocationConfig? {
    didSet {
      impl.locationConfig = locationConfig
    }
  }

  @MainActor
  var onMapError: ((RNMapErrorCode) -> Void)? {
    didSet { impl.onMapError = onMapError }
  }
  @MainActor
  var onMapReady: ((Bool) -> Void)? {
    didSet { impl.onMapReady = onMapReady }
  }
  @MainActor
  var onMapLoaded: ((Bool) -> Void)? {
    didSet { impl.onMapLoaded = onMapLoaded }
  }
  @MainActor
  var onLocationUpdate: ((RNLocation) -> Void)? {
    didSet { impl.onLocationUpdate = onLocationUpdate }
  }
  @MainActor
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)? {
    didSet { impl.onLocationError = onLocationError }
  }
  @MainActor
  var onMapPress: ((RNLatLng) -> Void)? {
    didSet { impl.onMapPress = onMapPress }
  }
  @MainActor
  var onMapLongPress: ((RNLatLng) -> Void)? {
    didSet { impl.onMapLongPress = onMapLongPress }
  }
  @MainActor
  var onPoiPress: ((String, String, RNLatLng) -> Void)? {
    didSet { impl.onPoiPress = onPoiPress }
  }
  @MainActor
  var onMarkerPress: ((String?) -> Void)? {
    didSet { impl.onMarkerPress = onMarkerPress }
  }
  @MainActor
  var onPolylinePress: ((String?) -> Void)? {
    didSet { impl.onPolylinePress = onPolylinePress }
  }
  @MainActor
  var onPolygonPress: ((String?) -> Void)? {
    didSet { impl.onPolygonPress = onPolygonPress }
  }
  @MainActor
  var onCirclePress: ((String?) -> Void)? {
    didSet { impl.onCirclePress = onCirclePress }
  }
  @MainActor
  var onMarkerDragStart: ((String?, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDragStart = onMarkerDragStart }
  }
  @MainActor
  var onMarkerDrag: ((String?, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDrag = onMarkerDrag }
  }
  @MainActor
  var onMarkerDragEnd: ((String?, RNLatLng) -> Void)? {
    didSet { impl.onMarkerDragEnd = onMarkerDragEnd }
  }
  @MainActor
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Void)? {
    didSet { impl.onIndoorBuildingFocused = onIndoorBuildingFocused }
  }
  @MainActor
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Void)? {
    didSet { impl.onIndoorLevelActivated = onIndoorLevelActivated }
  }
  @MainActor
  var onInfoWindowPress: ((String?) -> Void)?{
    didSet { impl.onInfoWindowPress = onInfoWindowPress }
  }
  @MainActor
  var onInfoWindowClose: ((String?) -> Void)?{
    didSet { impl.onInfoWindowClose = onInfoWindowClose }
  }
  @MainActor
  var onInfoWindowLongPress: ((String?) -> Void)?{
    didSet { impl.onInfoWindowLongPress = onInfoWindowLongPress }
  }
  @MainActor
  var onMyLocationPress: ((RNLocation) -> Void)?{
    didSet { impl.onMyLocationPress = onMyLocationPress }
  }
  @MainActor
  var onMyLocationButtonPress: ((Bool) -> Void)? {
    didSet { impl.onMyLocationButtonPress = onMyLocationButtonPress }
  }
  @MainActor
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeStart = onCameraChangeStart }
  }
  @MainActor
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChange = onCameraChange }
  }
  @MainActor
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeComplete = onCameraChangeComplete }
  }

  @MainActor
  func setCamera(camera: RNCamera, animated: Bool?, durationMs: Double?) {
    let cam = camera.toGMSCameraPosition(current: impl.currentCamera)
    impl.setCamera(
      camera: cam,
      animated: animated ?? true,
      durationMs: durationMs ?? 3000
    )
  }

  @MainActor
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

  @MainActor
  func setCameraBounds(bounds: RNLatLngBounds?) {
    impl.setCameraBounds(bounds?.toCoordinateBounds())
  }

  @MainActor
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

  @MainActor
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

  @MainActor
  func showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  @MainActor
  func openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  @MainActor
  func requestLocationPermission()
  -> NitroModules.Promise<RNLocationPermissionResult> {
    return permissionHandler.requestLocationPermission()
  }

  @MainActor
  func isGooglePlayServicesAvailable() -> Bool {
    /// not supported
    return true
  }
}
