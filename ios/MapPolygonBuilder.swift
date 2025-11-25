import GoogleMaps

final class MapPolygonBuilder {
  func build(_ p: RNPolygon) -> GMSPolygon {
    let path = p.coordinates.toGMSPath()
    let pg = GMSPolygon(path: path)

    p.fillColor.map { pg.fillColor = $0.toUIColor() }
    p.strokeColor.map { pg.strokeColor = $0.toUIColor() }
    p.strokeWidth.map { pg.strokeWidth = CGFloat($0) }
    p.pressable.map { pg.isTappable = $0 }
    p.geodesic.map { pg.geodesic = $0 }
    pg.holes = p.holes.toMapPolygonHoles()
    p.zIndex.map { pg.zIndex = Int32($0) }

    return pg
  }

  func update(_ prev: RNPolygon, _ next: RNPolygon, _ pg: GMSPolygon) {
    onMain {
      if !prev.coordinatesEquals(next) {
        pg.path = next.coordinates.toGMSPath()
      }

      if !prev.holesEquals(next) {
        pg.holes = next.holes.toMapPolygonHoles()
      }

      if prev.fillColor != next.fillColor {
        pg.fillColor = next.fillColor?.toUIColor() ?? .clear
      }

      if prev.strokeColor != next.strokeColor {
        pg.strokeColor = next.strokeColor?.toUIColor() ?? .black
      }

      if prev.strokeWidth != next.strokeWidth {
        pg.strokeWidth = CGFloat(next.strokeWidth ?? 1.0)
      }

      if prev.pressable != next.pressable {
        pg.isTappable = next.pressable ?? false
      }

      if prev.geodesic != next.geodesic {
        pg.geodesic = next.geodesic ?? false
      }

      if prev.zIndex != next.zIndex {
        pg.zIndex = Int32(next.zIndex ?? 0)
      }
    }
  }
}
