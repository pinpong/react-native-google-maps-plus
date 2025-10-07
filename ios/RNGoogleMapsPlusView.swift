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

  /*
   /// TODO: prepareForRecycle
   override func prepareForRecycle() {
   impl.clearAll()
   }
   */

  @MainActor
  var initialProps: RNInitialProps? {
    didSet {
      impl.initMapView(
        mapId: initialProps?.mapId,
        liteMode: initialProps?.liteMode,
        camera: initialProps?.camera?.toGMSCameraPosition(current: nil)
      )
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
  var minZoomLevel: Double? {
    didSet { impl.minZoomLevel = minZoomLevel }
  }

  @MainActor
  var maxZoomLevel: Double? {
    didSet { impl.maxZoomLevel = maxZoomLevel }
  }

  @MainActor
  var mapPadding: RNMapPadding? {
    didSet { impl.mapPadding = mapPadding }
  }

  @MainActor
  var mapType: RNMapType? {
    didSet {
      impl.mapType = mapType.map {
        GMSMapViewType(rawValue: UInt($0.rawValue)) ?? .normal
      }
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
          impl.removeMarker(id: $0)
          markerBuilder.cancelIconTask($0)
        }

        for (id, next) in nextById {
          if let prev = prevById[id] {
            if !prev.markerEquals(next) {
              impl.updateMarker(id: id) { m in
                self.markerBuilder.updateMarker(prev, next, m)
              }
            }
          } else {
            markerBuilder.buildIconAsync(next.id, next) { icon in
              guard let icon else { return }
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
              prev.updatePolyline(next, pl)
            }
          }
        } else {
          impl.addPolyline(
            id: id,
            polyline: polylineBuilder.buildPolyline(next)
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
              prev.updatePolygon(next, pg)
            }
          }
        } else {
          impl.addPolygon(id: id, polygon: polygonBuilder.buildPolygon(next))
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
              prev.updateCircle(next, circle)
            }
          }
        } else {
          impl.addCircle(id: id, circle: circleBuilder.buildCircle(next))
        }
      }
    }
  }

  @MainActor var locationConfig: RNLocationConfig? {
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
  var onLocationUpdate: ((RNLocation) -> Void)? {
    didSet { impl.onLocationUpdate = onLocationUpdate }
  }
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)? {
    didSet { impl.onLocationError = onLocationError }
  }
  var onMapPress: ((RNLatLng) -> Void)? {
    didSet { impl.onMapPress = onMapPress }
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
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeStart = onCameraChangeStart }
  }
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChange = onCameraChange }
  }
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)? {
    didSet { impl.onCameraChangeComplete = onCameraChangeComplete }
  }

  func setCamera(camera: RNCamera, animated: Bool?, durationMS: Double?) {
    let cam = camera.toGMSCameraPosition(current: impl.currentCamera)
    onMain {
      self.impl.setCamera(
        camera: cam,
        animated: animated ?? true,
        durationMS: durationMS ?? 3000
      )
    }
  }

  func setCameraToCoordinates(
    coordinates: [RNLatLng],
    padding: RNMapPadding?,
    animated: Bool?,
    durationMS: Double?
  ) {
    onMain {
      self.impl.setCameraToCoordinates(
        coordinates: coordinates,
        padding: padding ?? RNMapPadding(0, 0, 0, 0),
        animated: animated ?? true,
        durationMS: durationMS ?? 3000
      )
    }
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
    return true
  }
}

@inline(__always)
func onMain(_ block: @escaping () -> Void) {
  if Thread.isMainThread {
    block()
  } else {
    DispatchQueue.main.async { block() }
  }
}
