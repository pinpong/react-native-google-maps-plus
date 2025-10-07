import GoogleMaps

extension RNCircle {
  func updateCircle(_ next: RNCircle, _ c: GMSCircle) {
    c.position = CLLocationCoordinate2D(
      latitude: next.center.latitude,
      longitude: next.center.longitude
    )
    if let r = next.radius { c.radius = r }
    if let fc = next.fillColor?.toUIColor() { c.fillColor = fc }
    if let sc = next.strokeColor?.toUIColor() { c.strokeColor = sc }
    if let sw = next.strokeWidth { c.strokeWidth = CGFloat(sw) }
    if let pr = next.pressable { c.isTappable = pr }
    if let zi = next.zIndex { c.zIndex = Int32(zi) }
  }

  func circleEquals(_ b: RNCircle) -> Bool {
    zIndex == b.zIndex && pressable == b.pressable
      && center.latitude == b.center.latitude
      && center.longitude == b.center.longitude && radius == b.radius
      && strokeWidth == b.strokeWidth && strokeColor == b.strokeColor
      && fillColor == b.fillColor
  }
}
