import GoogleMaps

extension GMSCoordinateBounds {
  func toRNLatLngBounds() -> RNLatLngBounds {
    return RNLatLngBounds(
      southwest: southWest.toRNLatLng(),
      northeast: northEast.toRNLatLng()
    )
  }
}
