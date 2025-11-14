import CoreLocation

extension CLLocation {
  func toRnLocation() -> RNLocation {
    return RNLocation(
      center: RNLatLng(
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      ),
      altitude: altitude,
      accuracy: horizontalAccuracy,
      bearing: course,
      speed: speed,
      time: timestamp.timeIntervalSince1970 * 1000,
      android: nil,
      ios: RNLocationIOS(
        horizontalAccuracy: horizontalAccuracy,
        verticalAccuracy: verticalAccuracy,
        speedAccuracy: speedAccuracy,
        courseAccuracy: courseAccuracy,
        floor: floor.map { Double($0.level) },
        isFromMockProvider: false,
        timestamp: timestamp.timeIntervalSince1970 * 1000
      )
    )
  }
}
