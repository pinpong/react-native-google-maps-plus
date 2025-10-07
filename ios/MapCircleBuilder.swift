import GoogleMaps

final class MapCircleBuilder {

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
