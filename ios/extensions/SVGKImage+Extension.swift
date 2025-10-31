import SVGKit

extension SVGKImage {
  @inline(__always)
  func clear() {
    caLayerTree?.sublayers?.forEach { $0.removeFromSuperlayer() }
    if let layer = caLayerTree {
      layer.sublayers?.forEach { $0.removeFromSuperlayer() }
      layer.removeFromSuperlayer()
    }

    if let dom = domDocument {
      dom.childNodes = nil
    }

    if let root = domTree {
      root.childNodes = nil
    }

    caLayerTree.sublayers?.removeAll()
  }
}
