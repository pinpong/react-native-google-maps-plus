import GoogleMaps

extension RNMarker {
  func markerEquals(_ b: RNMarker) -> Bool {
    if id != b.id { return false }
    if zIndex != b.zIndex { return false }
    if !coordinateEquals(b) { return false }
    if !anchorEquals(b) { return false }
    if title != b.title { return false }
    if snippet != b.snippet { return false }
    if opacity != b.opacity { return false }
    if flat != b.flat { return false }
    if draggable != b.draggable { return false }
    if rotation != b.rotation { return false }
    if !infoWindowAnchorEquals(b) { return false }
    if !markerInfoWindowStyleEquals(b) { return false }
    if !markerStyleEquals(b) { return false }
    return true
  }

  func coordinateEquals(_ b: RNMarker) -> Bool {
    if coordinate.latitude != b.coordinate.latitude { return false }
    if coordinate.longitude != b.coordinate.longitude { return false }
    return true
  }

  func anchorEquals(_ b: RNMarker) -> Bool {
    if anchor?.x != b.anchor?.x { return false }
    if anchor?.y != b.anchor?.y { return false }
    return true
  }

  func infoWindowAnchorEquals(_ b: RNMarker) -> Bool {
    if infoWindowAnchor?.x != b.infoWindowAnchor?.x { return false }
    if infoWindowAnchor?.y != b.infoWindowAnchor?.y { return false }
    return true
  }

  func markerInfoWindowStyleEquals(_ b: RNMarker) -> Bool {
    if infoWindowIconSvg?.width != b.infoWindowIconSvg?.width { return false }
    if infoWindowIconSvg?.height != b.infoWindowIconSvg?.height { return false }
    if infoWindowIconSvg?.svgString != b.infoWindowIconSvg?.svgString { return false }
    return true
  }

  func markerStyleEquals(_ b: RNMarker) -> Bool {
    if iconSvg?.width != b.iconSvg?.width { return false }
    if iconSvg?.height != b.iconSvg?.height { return false }
    if iconSvg?.svgString != b.iconSvg?.svgString { return false }
    return true
  }

  func styleHash() -> NSNumber {
    var hasher = Hasher()
    hasher.combine(iconSvg?.width)
    hasher.combine(iconSvg?.height)
    hasher.combine(iconSvg?.svgString)
    return NSNumber(value: hasher.finalize())
  }
}
