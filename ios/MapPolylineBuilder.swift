import GoogleMaps

final class MapPolylineBuilder {
  @MainActor
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

  @MainActor
  func update(_ prev: RNPolyline, _ next: RNPolyline, _ pl: GMSPolyline) {
    if !prev.coordinatesEquals(next) {
      pl.path = next.coordinates.toGMSPath()
    }

    if prev.width != next.width {
      pl.strokeWidth = CGFloat(next.width ?? 1.0)
    }

    if prev.color != next.color {
      pl.strokeColor = next.color?.toUIColor() ?? .black
    }

    if prev.pressable != next.pressable {
      pl.isTappable = next.pressable ?? false
    }

    if prev.geodesic != next.geodesic {
      pl.geodesic = next.geodesic ?? false
    }

    if prev.zIndex != next.zIndex {
      pl.zIndex = Int32(next.zIndex ?? 0)
    }
  }
}
