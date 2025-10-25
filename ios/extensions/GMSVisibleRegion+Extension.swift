import GoogleMaps

extension GMSVisibleRegion {
  func toRNRegion() -> RNRegion {
    let bounds = GMSCoordinateBounds(region: self)
    return RNRegion(
      nearLeft: nearLeft.toRNLatLng(),
      nearRight: nearRight.toRNLatLng(),
      farLeft: farLeft.toRNLatLng(),
      farRight: farRight.toRNLatLng(),
      latLngBounds: bounds.toRNLatLngBounds()
    )
  }
}
