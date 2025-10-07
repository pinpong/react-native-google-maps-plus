import CoreLocation

extension RNIOSLocationAccuracy {
  var toCLLocationAccuracy: CLLocationAccuracy {
    switch self {
    case .accuracyBest:
      return kCLLocationAccuracyBest

    case .accuracyNearestTenMeter:
      return kCLLocationAccuracyNearestTenMeters

    case .accuracyNearestHundredMeter:
      return kCLLocationAccuracyHundredMeters

    case .accuracyKilometer:
      return kCLLocationAccuracyKilometer
    }
  }
}
