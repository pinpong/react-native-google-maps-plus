import Foundation

extension RNUrlTileOverlay {
  func urlTileOverlayEquals(_ b: RNUrlTileOverlay) -> Bool {
    if zIndex != b.zIndex { return false }
    if url != b.url { return false }
    if tileSize != b.tileSize { return false }
    if opacity != b.opacity { return false }
    if fadeIn != b.fadeIn { return false }
    return true
  }
}
