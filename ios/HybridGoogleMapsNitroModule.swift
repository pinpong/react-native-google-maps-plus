final class HybridGoogleMapsNitroModule: HybridGoogleMapsNitroModuleSpec {
  private let permissionHandler: PermissionHandler
  private let locationHandler: LocationHandler

  override init() {
    self.permissionHandler = PermissionHandler()
    self.locationHandler = LocationHandler()
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
