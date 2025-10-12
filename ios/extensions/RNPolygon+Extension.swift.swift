import GoogleMaps

extension RNPolygon {
  func polygonEquals(_ b: RNPolygon) -> Bool {
    guard zIndex == b.zIndex,
          pressable == b.pressable,
          strokeWidth == b.strokeWidth,
          fillColor == b.fillColor,
          strokeColor == b.strokeColor,
          geodesic == b.geodesic,
          coordinates.count == b.coordinates.count,
          holes?.count == b.holes?.count
    else { return false }

    for i in 0..<coordinates.count {
      if coordinates[i].latitude != b.coordinates[i].latitude
        || coordinates[i].longitude != b.coordinates[i].longitude {
        return false
      }
    }

    for i in 0..<(holes?.count ?? 0) {
      let ha = holes![i]
      let hb = b.holes![i]
      if ha.coordinates.count != hb.coordinates.count { return false }

      for j in 0..<ha.coordinates.count {
        if ha.coordinates[j].latitude != hb.coordinates[j].latitude
          || ha.coordinates[j].longitude != hb.coordinates[j].longitude {
          return false
        }
      }
    }

    return true
  }
}
