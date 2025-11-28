import GoogleMaps

final class MapCircleBuilder {
  func build(_ c: RNCircle) -> GMSCircle {
    let circle = GMSCircle()
    circle.position = c.center.toCLLocationCoordinate2D()
    circle.radius = c.radius
    c.fillColor.map { circle.fillColor = $0.toUIColor() }
    c.strokeColor.map { circle.strokeColor = $0.toUIColor() }
    c.strokeWidth.map { circle.strokeWidth = CGFloat($0) }
    c.pressable.map { circle.isTappable = $0 }
    c.zIndex.map { circle.zIndex = Int32($0) }

    return circle
  }

  func update(_ prev: RNCircle, _ next: RNCircle, _ c: GMSCircle) {
    onMain {
      if !prev.centerEquals(next) {
        c.position = next.center.toCLLocationCoordinate2D()
      }

      if prev.radius != next.radius {
        c.radius = next.radius
      }

      if prev.fillColor != next.fillColor {
        c.fillColor = next.fillColor?.toUIColor() ?? .clear
      }

      if prev.strokeColor != next.strokeColor {
        c.strokeColor = next.strokeColor?.toUIColor() ?? .black
      }

      if prev.strokeWidth != next.strokeWidth {
        c.strokeWidth = CGFloat(next.strokeWidth ?? 1.0)
      }

      if prev.pressable != next.pressable {
        c.isTappable = next.pressable ?? false
      }

      if prev.zIndex != next.zIndex {
        c.zIndex = Int32(next.zIndex ?? 0)
      }
    }
  }
}
