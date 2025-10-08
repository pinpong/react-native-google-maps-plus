import GoogleMaps

extension RNCircle {
  func circleEquals(_ b: RNCircle) -> Bool {
    zIndex == b.zIndex && pressable == b.pressable
      && center.latitude == b.center.latitude
      && center.longitude == b.center.longitude && radius == b.radius
      && strokeWidth == b.strokeWidth && strokeColor == b.strokeColor
      && fillColor == b.fillColor
  }
}
