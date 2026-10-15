import CoreLocation

extension CLHeading {
  func toRNHeading() -> RNHeading {
    return RNHeading(
      // trueHeading is negative without a location fix.
      heading: trueHeading >= 0 ? trueHeading : magneticHeading,
      accuracy: headingAccuracy,
      time: timestamp.timeIntervalSince1970 * 1000
    )
  }
}
