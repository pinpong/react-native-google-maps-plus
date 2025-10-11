import GoogleMaps

final class MapPolylineBuilder {
  func build(_ p: RNPolyline) -> GMSPolyline {
    let path = GMSMutablePath()
    p.coordinates.forEach {
      path.add(
        $0.toCLLocationCoordinate2D()
      )
    }

    let pl = GMSPolyline(path: path)

    p.width.map { pl.strokeWidth = CGFloat($0) }
    p.color.map { pl.strokeColor = $0.toUIColor() }
    p.lineCap.map { _ in /* not supported */ }
    p.lineJoin.map { _ in /* not supported */ }
    p.pressable.map { pl.isTappable = $0 }
    p.geodesic.map { pl.geodesic = $0 }
    p.zIndex.map { pl.zIndex = Int32($0) }

    return pl
  }

  func update(_ next: RNPolyline, _ pl: GMSPolyline) {
    let path = GMSMutablePath()
    next.coordinates.forEach {
      path.add(
        $0.toCLLocationCoordinate2D()
      )
    }
    pl.path = path

    /* lineCap not supported */
    /* lineJoin not supported */
    pl.strokeWidth = CGFloat(next.width ?? 1.0)
    pl.strokeColor = next.color?.toUIColor() ?? .black
    pl.isTappable = next.pressable ?? false
    pl.geodesic = next.geodesic ?? false
    pl.zIndex = Int32(next.zIndex ?? 0)
  }
}
