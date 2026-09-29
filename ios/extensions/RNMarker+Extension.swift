import GoogleMaps

extension RNMarker {
  func markerEquals(_ b: RNMarker) -> Bool {
    if id != b.id { return false }
    if zIndex != b.zIndex { return false }
    if !coordinatesEquals(b) { return false }
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
    if !advancedMarkerEquals(b) { return false }
    return true
  }

  func advancedMarkerEquals(_ b: RNMarker) -> Bool {
    if (advancedOptions != nil) != (b.advancedOptions != nil) { return false }
    if advancedOptions?.collisionBehavior != b.advancedOptions?.collisionBehavior { return false }
    return true
  }

  func coordinatesEquals(_ b: RNMarker) -> Bool {
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

  func infoWindowContentEquals(_ b: RNMarker) -> Bool {
    let hasInfoWindowIcon = infoWindowIconSvg != nil
    if hasInfoWindowIcon != (b.infoWindowIconSvg != nil) { return false }
    if hasInfoWindowIcon { return markerInfoWindowStyleEquals(b) }
    if title != b.title { return false }
    if snippet != b.snippet { return false }
    return true
  }

  func infoWindowIsEmpty() -> Bool {
    infoWindowIconSvg == nil && title == nil && snippet == nil
  }

  func markerStyleEquals(_ b: RNMarker) -> Bool {
    if iconSvg?.width != b.iconSvg?.width { return false }
    if iconSvg?.height != b.iconSvg?.height { return false }
    if iconSvg?.svgString != b.iconSvg?.svgString { return false }
    if !markerPinConfigEquals(b) { return false }
    return true
  }

  func markerPinConfigEquals(_ b: RNMarker) -> Bool {
    let pinConfig = advancedOptions?.pinConfig
    let bPinConfig = b.advancedOptions?.pinConfig
    if (pinConfig != nil) != (bPinConfig != nil) { return false }
    if pinConfig?.backgroundColor != bPinConfig?.backgroundColor { return false }
    if pinConfig?.borderColor != bPinConfig?.borderColor { return false }
    if pinConfig?.glyph?.iconSvg?.width != bPinConfig?.glyph?.iconSvg?.width { return false }
    if pinConfig?.glyph?.iconSvg?.height != bPinConfig?.glyph?.iconSvg?.height { return false }
    if pinConfig?.glyph?.iconSvg?.svgString != bPinConfig?.glyph?.iconSvg?.svgString { return false }
    if pinConfig?.glyph?.text != bPinConfig?.glyph?.text { return false }
    if pinConfig?.glyph?.textColor != bPinConfig?.glyph?.textColor { return false }
    if pinConfig?.glyph?.color != bPinConfig?.glyph?.color { return false }
    return true
  }

  func styleHash() -> NSNumber {
    var hasher = Hasher()
    hasher.combine(iconSvg?.width)
    hasher.combine(iconSvg?.height)
    hasher.combine(iconSvg?.svgString)
    let pinConfig = advancedOptions?.pinConfig
    hasher.combine(pinConfig != nil)
    hasher.combine(pinConfig?.backgroundColor)
    hasher.combine(pinConfig?.borderColor)
    hasher.combine(pinConfig?.glyph?.iconSvg?.width)
    hasher.combine(pinConfig?.glyph?.iconSvg?.height)
    hasher.combine(pinConfig?.glyph?.iconSvg?.svgString)
    hasher.combine(pinConfig?.glyph?.text)
    hasher.combine(pinConfig?.glyph?.textColor)
    hasher.combine(pinConfig?.glyph?.color)
    return NSNumber(value: hasher.finalize())
  }
}
