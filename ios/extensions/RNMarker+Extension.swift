import GoogleMaps

extension RNMarker {
  func markerEquals(_ b: RNMarker) -> Bool {
    id == b.id && zIndex == b.zIndex
      && coordinate.latitude == b.coordinate.latitude
      && coordinate.longitude == b.coordinate.longitude
      && anchor?.x == b.anchor?.x && anchor?.y == b.anchor?.y
      && showInfoWindow == b.showInfoWindow && title == b.title
      && snippet == b.snippet && opacity == b.opacity && flat == b.flat
      && draggable == b.draggable && rotation == b.rotation
      && infoWindowAnchor?.x == b.infoWindowAnchor?.x
      && infoWindowAnchor?.y == b.infoWindowAnchor?.y
      && markerStyleEquals(b)
  }

  func markerStyleEquals(_ b: RNMarker) -> Bool {
    iconSvg?.width == b.iconSvg?.width && iconSvg?.height == b.iconSvg?.height
      && iconSvg?.svgString == b.iconSvg?.svgString
  }

  func styleHash() -> NSNumber {
    var hasher = Hasher()
    hasher.combine(iconSvg?.width)
    hasher.combine(iconSvg?.height)
    hasher.combine(iconSvg?.svgString)
    return NSNumber(value: hasher.finalize())
  }
}
