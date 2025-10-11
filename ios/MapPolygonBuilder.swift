import GoogleMaps

final class MapPolygonBuilder {
  func build(_ p: RNPolygon) -> GMSPolygon {
    let path = GMSMutablePath()
    p.coordinates.forEach {
      path.add(
        $0.toCLLocationCoordinate2D()
      )
    }

    let pg = GMSPolygon(path: path)

    p.fillColor.map { pg.fillColor = $0.toUIColor() }
    p.strokeColor.map { pg.strokeColor = $0.toUIColor() }
    p.strokeWidth.map { pg.strokeWidth = CGFloat($0) }
    p.pressable.map { pg.isTappable = $0 }
    p.geodesic.map { pg.geodesic = $0 }
    p.holes.map {
      pg.holes = $0.map { hole in
        let path = GMSMutablePath()
        hole.coordinates.forEach { path.add($0.toCLLocationCoordinate2D()) }
        return path
      }
    }
    p.zIndex.map { pg.zIndex = Int32($0) }

    return pg
  }

  func update(_ next: RNPolygon, _ pg: GMSPolygon) {
    let path = GMSMutablePath()
    next.coordinates.forEach {
      path.add(
        $0.toCLLocationCoordinate2D()
      )
    }
    pg.path = path

    pg.fillColor = next.fillColor?.toUIColor() ?? .clear
    pg.strokeColor = next.strokeColor?.toUIColor() ?? .black
    pg.strokeWidth = CGFloat(next.strokeWidth ?? 1.0)
    pg.isTappable = next.pressable ?? false
    pg.geodesic = next.geodesic ?? false
    pg.holes =
      next.holes?.map { hole in
        let path = GMSMutablePath()
        hole.coordinates.forEach { path.add($0.toCLLocationCoordinate2D()) }
        return path
      } ?? []
    pg.zIndex = Int32(next.zIndex ?? 0)
  }
}
