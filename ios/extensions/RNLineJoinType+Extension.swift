extension RNLineJoinType {
  func toCGLineJoin() -> CGLineJoin {
    switch self {
    case .round: return .round
    case .bevel: return .bevel
    default: return .miter
    }
  }

}

