import GoogleMaps

extension RNPolygon {
  func updatePolygon(_ next: RNPolygon, _ pg: GMSPolygon) {
    let path = GMSMutablePath()
    next.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(
          latitude: $0.latitude,
          longitude: $0.longitude
        )
      )
    }
    pg.path = path

    if let fc = next.fillColor?.toUIColor() { pg.fillColor = fc }
    if let sc = next.strokeColor?.toUIColor() { pg.strokeColor = sc }
    if let sw = next.strokeWidth { pg.strokeWidth = CGFloat(sw) }
    if let pr = next.pressable { pg.isTappable = pr }
    if let zi = next.zIndex { pg.zIndex = Int32(zi) }
  }

  func polygonEquals(_ b: RNPolygon) -> Bool {
    guard zIndex == b.zIndex,
          pressable == b.pressable,
          strokeWidth == b.strokeWidth,
          fillColor == b.fillColor,
          strokeColor == b.strokeColor,
          coordinates.count == b.coordinates.count
    else { return false }
    for i in 0..<coordinates.count {
      if coordinates[i].latitude != b.coordinates[i].latitude
        || coordinates[i].longitude != b.coordinates[i].longitude {
        return false
      }
    }
    return true
  }
}
