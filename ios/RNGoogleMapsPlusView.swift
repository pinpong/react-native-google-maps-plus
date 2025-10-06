import CoreLocation
import Foundation
import GoogleMaps
import NitroModules

final class RNGoogleMapsPlusView: HybridRNGoogleMapsPlusViewSpec {

  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler

  private let markerOptions = MapMarkerOptions()
  private let polylineOptions = MapPolylineOptions()
  private let polygonOptions = MapPolygonOptions()
  private let circleOptions = MapCircleOptions()

  private let impl: GoogleMapsViewImpl

  var view: UIView {
    return impl
  }

  override init() {
    self.permissionHandler = PermissionHandler()
    self.locationHandler = LocationHandler()
    self.impl = GoogleMapsViewImpl(
      locationHandler: locationHandler,
      markerOptions: markerOptions
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
        camera: mapCameraToGMSCamera(initialProps?.initialCamera)
      )
    }
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
      impl.userInterfaceStyle = mapUserInterfaceStyleToUIUserInterfaceStyle(
        userInterfaceStyle
      )
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
          markerOptions.cancelIconTask($0)
        }

        for (id, next) in nextById {
          if let prev = prevById[id] {
            if !prev.markerEquals(next) {
              impl.updateMarker(id: id) { m in
                self.markerOptions.updateMarker(prev, next, m)
              }
            }
          } else {
            markerOptions.buildIconAsync(next.id, next) { icon in
              guard let icon else { return }
              let marker = self.markerOptions.build(next, icon: icon)
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
            polyline: polylineOptions.buildPolyline(next)
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
          impl.addPolygon(id: id, polygon: polygonOptions.buildPolygon(next))
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
          impl.addCircle(id: id, circle: circleOptions.buildCircle(next))
        }
      }
    }
  }

  func setCamera(camera: RNCamera, animated: Bool?, durationMS: Double?) {
    let current = impl.currentCamera

    let zoom = Float(camera.zoom ?? Double(current?.zoom ?? 0))
    let bearing = camera.bearing ?? current?.bearing ?? 0
    let viewingAngle = camera.bearing ?? current?.viewingAngle ?? 0

    let target = CLLocationCoordinate2D(
      latitude: camera.center?.latitude ?? current?.target.latitude ?? 0,
      longitude: camera.center?.longitude ?? current?.target.longitude ?? 0
    )

    let cam = GMSCameraPosition.camera(
      withTarget: target,
      zoom: zoom,
      bearing: bearing,
      viewingAngle: viewingAngle
    )
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

  private func mapCameraToGMSCamera(_ c: RNCamera?) -> GMSCameraPosition? {
    guard let c = c else { return nil }

    let current = impl.currentCamera
    let center = CLLocationCoordinate2D(
      latitude: c.center?.latitude ?? current?.target.latitude ?? 0,
      longitude: c.center?.longitude ?? current?.target.longitude ?? 0
    )
    let z = Float(c.zoom ?? Double(current?.zoom ?? 0))
    let b = c.bearing ?? current?.bearing ?? 0
    let t = c.tilt ?? current?.viewingAngle ?? 0

    return GMSCameraPosition.camera(
      withTarget: center,
      zoom: z,
      bearing: b,
      viewingAngle: t
    )
  }

  func mapUserInterfaceStyleToUIUserInterfaceStyle(
    _ style: RNUserInterfaceStyle?
  ) -> UIUserInterfaceStyle? {
    guard let style = style else { return nil }

    switch style {
    case .light:
      return .light
    case .dark:
      return .dark
    case .default:
      return .unspecified
    }
  }
}

extension UIUserInterfaceStyle {
  init?(fromString string: String) {
    switch string.lowercased() {
    case "light": self = .light
    case "dark": self = .dark
    case "default": self = .unspecified
    default: return nil
    }
  }

  var stringValue: String {
    switch self {
    case .light: return "light"
    case .dark: return "dark"
    case .unspecified: return "default"
    @unknown default: return "default"
    }
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
