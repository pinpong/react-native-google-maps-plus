import CoreLocation

extension RNLatLng {
  func toCLLocationCoordinate2D() -> CLLocationCoordinate2D {
    CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
  }
}
