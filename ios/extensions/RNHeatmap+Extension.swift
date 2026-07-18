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

extension RNHeatmap {
  func heatmapEquals(_ b: RNHeatmap) -> Bool {
    if pressable != b.pressable { return false }
    if zIndex != b.zIndex { return false }
    if radius != b.radius { return false }
    if opacity != b.opacity { return false }
    if !weightedDataEquals(b) { return false }
    if !gradientEquals(b) { return false }
    return true
  }

  func heatmapNeedsRebuild(_ b: RNHeatmap) -> Bool {
    if radius != nil, b.radius == nil { return true }
    if opacity != nil, b.opacity == nil { return true }
    if gradient != nil, b.gradient == nil { return true }
    return false
  }

  func weightedDataEquals(_ b: RNHeatmap) -> Bool {
    guard weightedData.count == b.weightedData.count else { return false }
    for i in weightedData.indices {
      if weightedData[i].latitude != b.weightedData[i].latitude { return false }
      if weightedData[i].longitude != b.weightedData[i].longitude { return false }
      if weightedData[i].weight != b.weightedData[i].weight { return false }
    }
    return true
  }

  func gradientEquals(_ b: RNHeatmap) -> Bool {
    switch (gradient, b.gradient) {
    case (nil, nil):
      return true
    case let (lhs?, rhs?):
      return lhs.colors == rhs.colors
        && lhs.startPoints == rhs.startPoints
        && lhs.colorMapSize == rhs.colorMapSize
    default:
      return false
    }
  }
}
