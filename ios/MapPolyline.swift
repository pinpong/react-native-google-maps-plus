import GoogleMaps

class MapPolylineOptions {
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
    pl.zIndex = Int32(p.zIndex)
    if let cap = p.lineCap {
      /// pl.lineCap = mapLineCap(cap)
    }
    if let join = p.lineJoin {
      /// pl.strokeJoin = mapLineJoin(join)
    }
    return pl
  }
}

func mapLineCap(_ t: RNLineCapType?) -> CGLineCap {
  switch t {
  case .round: return .round
  case .square: return .square
  default: return .butt
  }
}

func mapLineJoin(_ t: RNLineJoinType?) -> CGLineJoin {
  switch t {
  case .round: return .round
  case .bevel: return .bevel
  default: return .miter
  }
}

extension RNPolyline {
  func updatePolyline(_ next: RNPolyline, _ pl: GMSPolyline) {
    let path = GMSMutablePath()
    next.coordinates.forEach {
      path.add(
        CLLocationCoordinate2D(
          latitude: $0.latitude,
          longitude: $0.longitude
        )
      )
    }
    pl.path = path
    if let w = next.width { pl.strokeWidth = CGFloat(w) }
    if let cap = next.lineCap {
      pl.spans = nil
      /// gms.lineCap = mapLineCap(cap)
    }
    if let join = next.lineJoin {
      /// gms.strokeJoin = mapLineJoin(join)
    }
    if let c = next.color?.toUIColor() {
      pl.strokeColor = c
    }
    pl.zIndex = Int32(next.zIndex)
  }

  func polylineEquals(_ b: RNPolyline) -> Bool {
    guard zIndex == b.zIndex,
          (width ?? 0) == (b.width ?? 0),
          lineCap == b.lineCap,
          lineJoin == b.lineJoin,
          color == b.color,
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
