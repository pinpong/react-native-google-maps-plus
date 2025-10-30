import CoreLocation
import GoogleMaps

extension RNLatLng {
  func toCLLocationCoordinate2D() -> CLLocationCoordinate2D {
    CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
  }
}

extension Array where Element == RNLatLng {
  func toGMSPath() -> GMSPath {
    let path = GMSMutablePath()
    for coord in self {
      path.add(coord.toCLLocationCoordinate2D())
    }
    return path
  }
}
