import CoreLocation

extension RNIOSLocationActivityType {
  var toCLActivityType: CLActivityType {
    switch self {
    case .other:
      return .other
    case .navigation:
      return .otherNavigation
    case .automotive:
      return .automotiveNavigation
    case .fitness:
      return .fitness
    case .airborne:
      return .airborne
    }
  }
}
