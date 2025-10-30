import GoogleMaps

extension RNCircle {
  func circleEquals(_ b: RNCircle) -> Bool {
    if zIndex != b.zIndex { return false }
    if pressable != b.pressable { return false }
    if !centerEquals(b) { return false }
    if radius != b.radius { return false }
    if strokeWidth != b.strokeWidth { return false }
    if strokeColor != b.strokeColor { return false }
    if fillColor != b.fillColor { return false }
    return true
  }

  func centerEquals(_ b: RNCircle) -> Bool {
    if center.latitude != b.center.latitude { return false }
    if center.longitude != b.center.longitude { return false }
    return true
  }
}
