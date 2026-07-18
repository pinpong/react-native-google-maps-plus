import Foundation

extension RNKMLayer {
  func kmlLayerEquals(_ b: RNKMLayer) -> Bool {
    if kmlString != b.kmlString { return false }
    return true
  }
}
