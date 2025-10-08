import GoogleMaps

extension RNPolygon {
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
