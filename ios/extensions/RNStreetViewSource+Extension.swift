import GoogleMaps

extension RNStreetViewSource {
  var toGMSPanoramaSource: GMSPanoramaSource {
    switch self {
    case .default: return .default
    case .outdoor: return .outside
    }
  }
}
