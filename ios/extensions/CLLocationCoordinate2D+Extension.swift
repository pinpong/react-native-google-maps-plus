import CoreLocation

extension CLLocationCoordinate2D {
  func toRNLatLng() -> RNLatLng {
    RNLatLng(latitude: latitude, longitude: longitude)
  }
}
