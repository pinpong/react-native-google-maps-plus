import GoogleMaps

extension RNPolygon {
  func polygonEquals(_ b: RNPolygon) -> Bool {
    if zIndex != b.zIndex { return false }
    if pressable != b.pressable { return false }
    if strokeWidth != b.strokeWidth { return false }
    if fillColor != b.fillColor { return false }
    if strokeColor != b.strokeColor { return false }
    if geodesic != b.geodesic { return false }

    if !coordinatesEquals(b) { return false }
    if !holesEquals(b) { return false }

    return true
  }

  func coordinatesEquals(_ b: RNPolygon) -> Bool {
    if coordinates.count != b.coordinates.count { return false }

    for (a, c) in zip(coordinates, b.coordinates) {
      if a.latitude != c.latitude || a.longitude != c.longitude {
        return false
      }
    }

    return true
  }

  func holesEquals(_ b: RNPolygon) -> Bool {
    if let holes = holes, let bHoles = b.holes {
      if holes.count != bHoles.count { return false }

      for i in holes.indices {
        let ah = holes[i]
        let bh = bHoles[i]

        if ah.coordinates.count != bh.coordinates.count { return false }

        for j in ah.coordinates.indices {
          let p = ah.coordinates[j]
          let q = bh.coordinates[j]

          if p.latitude != q.latitude || p.longitude != q.longitude {
            return false
          }
        }
      }
    }

    return true
  }
}

extension Optional where Wrapped == [RNPolygonHole] {
  func toMapPolygonHoles() -> [GMSPath]? {
    guard let holes = self else { return nil }
    return holes.map { hole in
      let path = GMSMutablePath()
      hole.coordinates.forEach { coord in
        path.add(coord.toCLLocationCoordinate2D())
      }
      return path
    }
  }
}
