import GoogleMaps

final class MapPolygonBuilder {
  @MainActor
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

  @MainActor
  func update(_ prev: RNPolygon, _ next: RNPolygon, _ pg: GMSPolygon) {
    let coordsChanged =
      prev.coordinates.count != next.coordinates.count
        || !zip(prev.coordinates, next.coordinates).allSatisfy {
          $0.latitude == $1.latitude && $0.longitude == $1.longitude
        }

    if coordsChanged {
      let path = GMSMutablePath()
      next.coordinates.forEach { path.add($0.toCLLocationCoordinate2D()) }
      pg.path = path
    }

    let prevHoles = prev.holes ?? []
    let nextHoles = next.holes ?? []
    let holesChanged =
      prevHoles.count != nextHoles.count
        || !zip(prevHoles, nextHoles).allSatisfy { a, b in
          a.coordinates.count == b.coordinates.count
            && zip(a.coordinates, b.coordinates).allSatisfy {
              $0.latitude == $1.latitude && $0.longitude == $1.longitude
            }
        }

    if holesChanged {
      pg.holes = nextHoles.map { hole in
        let path = GMSMutablePath()
        hole.coordinates.forEach { path.add($0.toCLLocationCoordinate2D()) }
        return path
      }
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
