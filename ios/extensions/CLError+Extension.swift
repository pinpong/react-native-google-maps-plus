import CoreLocation

extension CLError.Code {
  var toRNLocationErrorCode: RNLocationErrorCode {
    switch self {
    case .denied:
      return .permissionDenied
    case .locationUnknown, .network:
      return .positionUnavailable
    default:
      return .internalError
    }
  }
}
