import GoogleMaps

extension RNLatLngBounds {
  func toCoordinateBounds() -> GMSCoordinateBounds {
    return GMSCoordinateBounds(
      coordinate: CLLocationCoordinate2D(
        latitude: southwest.latitude,
        longitude: southwest.longitude
      ),
      coordinate: CLLocationCoordinate2D(
        latitude: northeast.latitude,
        longitude: northeast.longitude
      )
    )
  }
}
