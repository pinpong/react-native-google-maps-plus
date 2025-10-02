import CoreLocation
import Foundation
import GoogleMaps
import NitroModules

final class RNGoogleMapsPlusView: HybridRNGoogleMapsPlusViewSpec {

  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler

  private let impl: GoogleMapsViewImpl

  var view: UIView {
    return impl
  }

  private var currentCustomMapStyle: String = ""
  private let markerOptions = MapMarkerOptions()
  private let polylineOptions = MapPolylineOptions()
  private let polygonOptions = MapPolygonOptions()

  override init() {
    self.permissionHandler = PermissionHandler()
    self.locationHandler = LocationHandler()
    self.impl = GoogleMapsViewImpl(
      locationHandler: locationHandler,
      markerOptions: markerOptions
    )
  }

  @MainActor
  var buildingEnabled: Bool {
    get { impl.buildingEnabled }
    set { impl.buildingEnabled = newValue }
  }

  @MainActor
  var trafficEnabled: Bool {
    get { impl.trafficEnabled }
    set { impl.trafficEnabled = newValue }
  }

  @MainActor
  var customMapStyle: String {
    get { currentCustomMapStyle }
    set {
      currentCustomMapStyle = newValue
      impl.customMapStyle = try? GMSMapStyle(jsonString: newValue)
    }
  }

  @MainActor
  var initialCamera: RNCamera {
    get { mapCameraPositionToCamera(impl.initialCamera) }
    set { impl.initialCamera = mapCameraToGMSCamera(newValue) }
  }

  @MainActor
  var userInterfaceStyle: RNUserInterfaceStyle {
    get { mapUIUserInterfaceStyletoUserInterfaceStyle(impl.userInterfaceStyle) }
    set {
      impl.userInterfaceStyle = mapUserInterfaceStyleToUIUserInterfaceStyle(
        newValue
      )
    }
  }

  @MainActor
  var minZoomLevel: Double {
    get { impl.minZoomLevel }
    set { impl.minZoomLevel = newValue }
  }

  @MainActor
  var maxZoomLevel: Double {
    get { impl.maxZoomLevel }
    set { impl.maxZoomLevel = newValue }
  }

  @MainActor
  var mapPadding: RNMapPadding {
    get { impl.mapPadding }
    set { impl.mapPadding = newValue }
  }

  @MainActor
  var markers: [RNMarker] = [] {
    didSet {
      let prevById = Dictionary(
        oldValue.map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        markers.map { ($0.id, $0) },
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
  var polylines: [RNPolyline] = [] {
    didSet {
      let prevById = Dictionary(
        oldValue.map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        polylines.map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )

      let removed = Set(prevById.keys).subtracting(nextById.keys)
      removed.forEach { impl.removePolyline(id: $0) }

      for (id, next) in nextById {
        if let prev = prevById[id] {
          if !prev.polylineEquals(next) {
            impl.updatePolyline(id: id) { gms in
              prev.updatePolyline(next, gms)
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
  }

  @MainActor
  var polygons: [RNPolygon] = [] {
    didSet {
      let prevById = Dictionary(
        oldValue.map { ($0.id, $0) },
        uniquingKeysWith: { _, new in new }
      )
      let nextById = Dictionary(
        polygons.map { ($0.id, $0) },
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

  func setCamera(camera: RNCamera, animated: Bool?, durationMS: Double?) {
    onMain {
      self.impl.setCamera(
        camera: camera,
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
    get { impl.onMapError }
    set { impl.onMapError = newValue }
  }
  var onMapReady: ((Bool) -> Void)? {
    get { impl.onMapReady }
    set { impl.onMapReady = newValue }
  }
  var onLocationUpdate: ((RNLocation) -> Void)? {
    get { impl.onLocationUpdate }
    set { impl.onLocationUpdate = newValue }
  }
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)? {
    get { impl.onLocationError }
    set { impl.onLocationError = newValue }
  }
  var onMapPress: ((RNLatLng) -> Void)? {
    get { impl.onMapPress }
    set { impl.onMapPress = newValue }
  }
  var onMarkerPress: ((String) -> Void)? {
    get { impl.onMarkerPress }
    set { impl.onMarkerPress = newValue }
  }
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)? {
    get { impl.onCameraChangeStart }
    set { impl.onCameraChangeStart = newValue }
  }
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)? {
    get { impl.onCameraChange }
    set { impl.onCameraChange = newValue }
  }
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)? {
    get { impl.onCameraChangeComplete }
    set { impl.onCameraChangeComplete = newValue }
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

  private func mapCameraToGMSCamera(_ c: RNCamera) -> GMSCameraPosition {
    let current = impl.currentCamera
    let center = CLLocationCoordinate2D(
      latitude: c.center?.latitude ?? current.target.latitude,
      longitude: c.center?.longitude ?? current.target.longitude
    )
    let z = Float(c.zoom ?? Double(current.zoom))
    let b = c.bearing ?? current.bearing
    let t = c.tilt ?? current.viewingAngle

    return GMSCameraPosition.camera(
      withTarget: center,
      zoom: z,
      bearing: b,
      viewingAngle: t
    )
  }

  private func mapCameraPositionToCamera(_ cp: GMSCameraPosition)
    -> RNCamera {
    return RNCamera(
      center: RNLatLng(
        latitude: cp.target.latitude,
        longitude: cp.target.longitude
      ),
      zoom: Double(cp.zoom),
      bearing: cp.bearing,
      tilt: cp.viewingAngle
    )
  }

  func mapUserInterfaceStyleToUIUserInterfaceStyle(
    _ style: RNUserInterfaceStyle
  )
    -> UIUserInterfaceStyle {
    switch style {
    case .light: return .light
    case .dark: return .dark
    case .default: return .unspecified
    }
  }

  func mapUIUserInterfaceStyletoUserInterfaceStyle(
    _ uiStyle: UIUserInterfaceStyle
  ) -> RNUserInterfaceStyle {
    switch uiStyle {
    case .light: return .light
    case .dark: return .dark
    case .unspecified: return .default
    @unknown default: return .default
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
