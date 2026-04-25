import CoreLocation
import Foundation
import GoogleMaps
import NitroModules

final class RNGoogleMapsPlusStreetView: HybridRNGoogleMapsPlusStreetViewSpec {

  private let mapErrorHandler: MapErrorHandler
  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler
  private let impl: StreetViewPanoramaViewImpl

  var view: UIView {
    return impl
  }

  override init() {
    self.permissionHandler = PermissionHandler()
    self.locationHandler = LocationHandler()
    self.mapErrorHandler = MapErrorHandler()
    self.impl = StreetViewPanoramaViewImpl(
      mapErrorHandler: mapErrorHandler,
      locationHandler: locationHandler
    )
  }

  func onDropView() {
    impl.deinitInternal()
  }

  var initialProps: RNStreetViewInitialProps? {
    didSet { impl.streetViewInitialProps = initialProps }
  }

  var uiSettings: RNStreetViewUiSettings? {
    didSet { impl.uiSettings = uiSettings }
  }

  var onPanoramaReady: ((Bool) -> Void)? {
    didSet { impl.onPanoramaReady = onPanoramaReady }
  }
  var onLocationUpdate: ((RNLocation) -> Void)? {
    didSet { impl.onLocationUpdate = onLocationUpdate }
  }
  var onLocationError: ((RNLocationErrorCode) -> Void)? {
    didSet { impl.onLocationError = onLocationError }
  }
  var onPanoramaChange: ((RNStreetViewPanoramaLocation) -> Void)? {
    didSet { impl.onPanoramaChange = onPanoramaChange }
  }
  var onCameraChange: ((RNStreetViewCamera) -> Void)? {
    didSet { impl.onCameraChange = onCameraChange }
  }
  var onPanoramaPress: ((RNStreetViewOrientation) -> Void)? {
    didSet { impl.onPanoramaPress = onPanoramaPress }
  }
  var onPanoramaError: ((RNMapErrorCode, String) -> Void)? {
    didSet { mapErrorHandler.callback = onPanoramaError }
  }

  func setCamera(camera: RNStreetViewCamera, animated: Bool?, durationMs: Double?) {
    onMain {
      let cam = camera.toGMSPanoramaCamera(current: self.impl.currentCamera)
      self.impl.setCamera(cam, animated: animated ?? false, durationMs: durationMs ?? 3000)
    }
  }

  func setPosition(position: RNLatLng, radius: Double?, source: RNStreetViewSource?) {
    impl.setPosition(
      position.toCLLocationCoordinate2D(),
      radius: radius.map { UInt($0) },
      source: source?.toGMSPanoramaSource ?? .default
    )
  }

  func setPositionById(panoramaId: String) {
    impl.setPositionById(panoramaId)
  }

  func showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  func openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  func requestLocationPermission() -> NitroModules.Promise<RNLocationPermissionResult> {
    return permissionHandler.requestLocationPermission()
  }

  func isGooglePlayServicesAvailable() -> Bool {
    return false
  }
}
