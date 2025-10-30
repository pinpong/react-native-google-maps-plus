extension RNLineCapType {
  func toCGLineCap() -> CGLineCap {
    switch self {
    case .round: return .round
    case .square: return .square
    default: return .butt
    }
  }
}

