import GoogleMaps

final class MapPolylineBuilder {
  func buildPolyline(_ p: RNPolyline) -> GMSPolyline {
    let path = GMSMutablePath()
    p.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude)
      )
    }
    let pl = GMSPolyline(path: path)
    if let w = p.width { pl.strokeWidth = CGFloat(w) }
    if let c = p.color?.toUIColor() { pl.strokeColor = c }
    if let cap = p.lineCap {
      /// pl.lineCap = mapLineCap(cap)
    }
    if let join = p.lineJoin {
      /// pl.strokeJoin = mapLineJoin(join)
    }
    if let pr = p.pressable { pl.isTappable = pr }
    if let zi = p.zIndex { pl.zIndex = Int32(zi) }
    return pl
  }
}
