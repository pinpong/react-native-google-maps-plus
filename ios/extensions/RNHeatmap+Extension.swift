import CoreLocation
import Foundation
import GoogleMapsUtils

extension RNHeatmapPoint {
  func toWeightedLatLng() -> GMUWeightedLatLng {
    let coord = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    return GMUWeightedLatLng(coordinate: coord, intensity: Float(weight))
  }
}

extension Array where Element == RNHeatmapPoint {
  func toWeightedLatLngs() -> [GMUWeightedLatLng] {
    map { $0.toWeightedLatLng() }
  }
}
