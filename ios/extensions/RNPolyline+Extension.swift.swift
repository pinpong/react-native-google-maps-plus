import GoogleMaps

extension RNPolyline {
  func polylineEquals(_ b: RNPolyline) -> Bool {
    guard zIndex == b.zIndex,
          (width ?? 0) == (b.width ?? 0),
          lineCap == b.lineCap,
          lineJoin == b.lineJoin,
          color == b.color,
          geodesic == b.geodesic,
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

  private func mapLineCap(_ t: RNLineCapType) -> CGLineCap {
    switch t {
    case .round: return .round
    case .square: return .square
    default: return .butt
    }
  }

  private func mapLineJoin(_ t: RNLineJoinType) -> CGLineJoin {
    switch t {
    case .round: return .round
    case .bevel: return .bevel
    default: return .miter
    }
  }
}
