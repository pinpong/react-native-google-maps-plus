import GoogleMaps

extension GMSCameraPosition {
  func toRNCamera() -> RNCameraChange {
    return RNCameraChange(
      center: target.toRNLatLng(),
      zoom: Double(zoom),
      bearing: bearing,
      tilt: viewingAngle
    )
  }
}
