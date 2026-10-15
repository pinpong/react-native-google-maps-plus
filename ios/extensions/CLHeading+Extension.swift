import CoreLocation

extension CLHeading {
  func toRNHeading() -> RNHeading {
    // A negative accuracy means the heading could not be determined.
    guard headingAccuracy >= 0 else {
      return RNHeading(
        heading: -1,
        accuracy: -1,
        time: timestamp.timeIntervalSince1970 * 1000
      )
    }
    return RNHeading(
      // trueHeading is negative without a location fix.
      heading: trueHeading >= 0 ? trueHeading : magneticHeading,
      accuracy: headingAccuracy,
      time: timestamp.timeIntervalSince1970 * 1000
    )
  }
}
