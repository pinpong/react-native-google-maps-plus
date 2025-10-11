import GoogleMaps

extension RNLatLngBounds {
  func toCoordinateBounds() -> GMSCoordinateBounds {
    return GMSCoordinateBounds(
      coordinate: CLLocationCoordinate2D(
        latitude: southWest.latitude,
        longitude: southWest.longitude
      ),
      coordinate: CLLocationCoordinate2D(
        latitude: northEast.latitude,
        longitude: northEast.longitude
      )
    )
  }
}
