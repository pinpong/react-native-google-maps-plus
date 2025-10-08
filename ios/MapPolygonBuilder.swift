import GoogleMaps

final class MapPolygonBuilder {
  func build(_ p: RNPolygon) -> GMSPolygon {
    let path = GMSMutablePath()
    p.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude)
      )
    }

    let pg = GMSPolygon(path: path)

    p.fillColor.map { pg.fillColor = $0.toUIColor() }
    p.strokeColor.map { pg.strokeColor = $0.toUIColor() }
    p.strokeWidth.map { pg.strokeWidth = CGFloat($0) }
    p.pressable.map { pg.isTappable = $0 }
    p.zIndex.map { pg.zIndex = Int32($0) }

    return pg
  }

  func update(_ next: RNPolygon, _ pg: GMSPolygon) {
    let path = GMSMutablePath()
    next.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude)
      )
    }
    pg.path = path

    pg.fillColor = next.fillColor?.toUIColor() ?? .clear
    pg.strokeColor = next.strokeColor?.toUIColor() ?? .black
    pg.strokeWidth = CGFloat(next.strokeWidth ?? 1.0)
    pg.isTappable = next.pressable ?? false
    pg.zIndex = Int32(next.zIndex ?? 0)
  }
}
