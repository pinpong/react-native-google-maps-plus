import Foundation

extension RNKmlLayer {
  func kmlLayerEquals(_ b: RNKmlLayer) -> Bool {
    if kmlString != b.kmlString { return false }
    return true
  }
}
