import GoogleMaps

extension RNPolyline {
  func polylineEquals(_ b: RNPolyline) -> Bool {
    if zIndex != b.zIndex { return false }
    if width != b.width { return false }
    if lineCap != b.lineCap { return false }
    if lineJoin != b.lineJoin { return false }
    if color != b.color { return false }
    if geodesic != b.geodesic { return false }
    if !coordinatesEquals(b) { return false }

    return true
  }

  func coordinatesEquals(_ b: RNPolyline) -> Bool {
    if coordinates.count != b.coordinates.count { return false }

    for (a, c) in zip(coordinates, b.coordinates) {
      if a.latitude != c.latitude || a.longitude != c.longitude {
        return false
      }
    }

    return true
  }
}
