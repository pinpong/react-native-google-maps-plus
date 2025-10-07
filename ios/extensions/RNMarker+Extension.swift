import GoogleMaps

extension RNMarker {
  func markerEquals(_ b: RNMarker) -> Bool {
    id == b.id && zIndex == b.zIndex
      && coordinate.latitude == b.coordinate.latitude
      && coordinate.longitude == b.coordinate.longitude
      && anchor?.x == b.anchor?.x && anchor?.y == b.anchor?.y
      && markerStyleEquals(b)
  }

  func markerStyleEquals(_ b: RNMarker) -> Bool {
    width == b.width && height == b.height
      && iconSvg == b.iconSvg
  }

  func styleHash() -> NSString {
    var hasher = Hasher()
    hasher.combine(width)
    hasher.combine(height)
    hasher.combine(iconSvg)
    return String(hasher.finalize()) as NSString
  }
}
