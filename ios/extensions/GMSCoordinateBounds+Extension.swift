import GoogleMaps

extension GMSCoordinateBounds {
  func toRNRegion() -> RNRegion {
    let center = CLLocationCoordinate2D(
      latitude: (northEast.latitude + southWest.latitude) / 2.0,
      longitude: (northEast.longitude + southWest.longitude) / 2.0
    )

    let latDelta = northEast.latitude - southWest.latitude
    let lngDelta = northEast.longitude - southWest.longitude

    return RNRegion(
      center: center.toRNLatLng(),
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    )
  }
}
