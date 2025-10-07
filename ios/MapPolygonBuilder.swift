import GoogleMaps

final class MapPolygonBuilder {

  func buildPolygon(_ p: RNPolygon) -> GMSPolygon {
    let path = GMSMutablePath()
    p.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude)
      )
    }
    let pg = GMSPolygon(path: path)
    if let fc = p.fillColor?.toUIColor() { pg.fillColor = fc }
    if let sc = p.strokeColor?.toUIColor() { pg.strokeColor = sc }
    if let sw = p.strokeWidth { pg.strokeWidth = CGFloat(sw) }
    if let pr = p.pressable { pg.isTappable = pr }
    if let zi = p.zIndex { pg.zIndex = Int32(zi) }
    return pg
  }
}
