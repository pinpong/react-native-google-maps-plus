import CoreLocation

extension CLLocationManager {
  func toRNLocationPermissionResult() -> RNLocationPermissionResult {
    let accuracy: RNLocationPermissionAccuracy
    let status: RNIOSPermissionResult

    switch authorizationStatus {
    case .authorizedAlways, .authorizedWhenInUse:
      accuracy = accuracyAuthorization.toRNLocationPermissionAccuracy
      status = RNIOSPermissionResult.authorized
    default:
      accuracy = RNLocationPermissionAccuracy.none
      status = RNIOSPermissionResult.denied
    }

    return RNLocationPermissionResult(
      accuracy: accuracy,
      locationServicesEnabled: CLLocationManager.locationServicesEnabled(),
      android: nil,
      ios: status
    )
  }
}

extension CLAccuracyAuthorization {
  var toRNLocationPermissionAccuracy: RNLocationPermissionAccuracy {
    switch self {
    case .fullAccuracy:
      return RNLocationPermissionAccuracy.precise
    default:
      return RNLocationPermissionAccuracy.approximate
    }
  }
}
