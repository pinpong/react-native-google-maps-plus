import GoogleMaps

extension RNMarkerCollisionBehavior {
  var toGMSCollisionBehavior: GMSCollisionBehavior {
    switch self {
    case .required:
      return .required
    case .requiredAndHidesOptional:
      return .requiredAndHidesOptional
    case .optionalAndHidesLowerPriority:
      return .optionalAndHidesLowerPriority
    }
  }
}
