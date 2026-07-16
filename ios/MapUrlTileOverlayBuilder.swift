import GoogleMaps

class MapUrlTileOverlayBuilder {
  func build(_ t: RNUrlTileOverlay) -> GMSURLTileLayer {

    let constructor: GMSTileURLConstructor = { (x: UInt, y: UInt, zoom: UInt) in
      let urlString = t.url
        .replacingOccurrences(of: "{x}", with: "\(x)")
        .replacingOccurrences(of: "{y}", with: "\(y)")
        .replacingOccurrences(of: "{z}", with: "\(zoom)")
      return URL(string: urlString)
    }

    let layer = GMSURLTileLayer(urlConstructor: constructor)

    layer.tileSize = Int(t.tileSize)
    t.opacity.map { layer.opacity = Float($0) }
    t.zIndex.map { layer.zIndex = Int32($0) }
    t.fadeIn.map { layer.fadeIn = $0 }

    return layer
  }

  func update(
    _ prev: RNUrlTileOverlay,
    _ next: RNUrlTileOverlay,
    _ layer: GMSURLTileLayer
  ) {
    onMain {
      if prev.zIndex != next.zIndex {
        layer.zIndex = Int32(next.zIndex ?? 0)
      }

      if prev.opacity != next.opacity {
        layer.opacity = Float(next.opacity ?? 1)
      }

      if prev.fadeIn != next.fadeIn {
        layer.fadeIn = next.fadeIn ?? true
      }
    }
  }
}
