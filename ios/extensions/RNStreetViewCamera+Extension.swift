import GoogleMaps

extension RNStreetViewCamera {
  func toGMSPanoramaCamera(current: GMSPanoramaCamera? = nil) -> GMSPanoramaCamera {
    return GMSPanoramaCamera(
      heading: bearing ?? current?.orientation.heading ?? 0,
      pitch: tilt ?? current?.orientation.pitch ?? 0,
      zoom: Float(zoom ?? current.map { Double($0.zoom) } ?? 0)
    )
  }
}
