import GoogleMaps

class MapUrlTileOverlayBuilder {
  @MainActor
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
}
