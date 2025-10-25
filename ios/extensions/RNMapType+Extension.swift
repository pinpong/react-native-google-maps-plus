import GoogleMaps

extension RNMapType {
  var toGMSMapViewType: GMSMapViewType {
    switch self {
    case .none:
      return .none
    case .normal:
      return .normal
    case .hybrid:
      return .hybrid
    case .satellite:
      return .satellite
    case .terrain:
      return .terrain
    }
  }
}
