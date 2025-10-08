import GoogleMaps

final class MapCircleBuilder {
  func build(_ c: RNCircle) -> GMSCircle {
    let circle = GMSCircle()
    circle.position = CLLocationCoordinate2D(
      latitude: c.center.latitude,
      longitude: c.center.longitude
    )

    circle.radius = c.radius
    c.fillColor.map { circle.fillColor = $0.toUIColor() }
    c.strokeColor.map { circle.strokeColor = $0.toUIColor() }
    c.strokeWidth.map { circle.strokeWidth = CGFloat($0) }
    c.pressable.map { circle.isTappable = $0 }
    c.zIndex.map { circle.zIndex = Int32($0) }

    return circle
  }

  func update(_ next: RNCircle, _ c: GMSCircle) {
    c.position = CLLocationCoordinate2D(
      latitude: next.center.latitude,
      longitude: next.center.longitude
    )

    c.radius = next.radius
    c.fillColor = next.fillColor?.toUIColor() ?? nil
    c.strokeColor = next.strokeColor?.toUIColor() ?? .black
    c.strokeWidth = CGFloat(next.strokeWidth ?? 1.0)
    c.isTappable = next.pressable ?? false
    c.zIndex = Int32(next.zIndex ?? 0)
  }

}
