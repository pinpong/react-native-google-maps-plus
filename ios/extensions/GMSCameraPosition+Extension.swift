import GoogleMaps

extension GMSCameraPosition {
  func toRNCamera() -> RNCamera {
    return RNCamera(
      center: target.toRNLatLng(),
      zoom: Double(zoom),
      bearing: bearing,
      tilt: viewingAngle
    )
  }
}
