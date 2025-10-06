import GoogleMaps

class MapCircleOptions {

  func buildCircle(_ c: RNCircle) -> GMSCircle {
    let circle = GMSCircle()
    circle.position = CLLocationCoordinate2D(
      latitude: c.center.latitude,
      longitude: c.center.longitude
    )
    if let r = c.radius { circle.radius = r }
    if let fc = c.fillColor?.toUIColor() { circle.fillColor = fc }
    if let sc = c.strokeColor?.toUIColor() { circle.strokeColor = sc }
    if let sw = c.strokeWidth { circle.strokeWidth = CGFloat(sw) }
    if let pr = c.pressable { circle.isTappable = pr }
    if let zi = c.zIndex { circle.zIndex = Int32(zi) }

    return circle
  }
}

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
