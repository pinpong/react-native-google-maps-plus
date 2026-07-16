import Foundation
import GoogleMaps
import GoogleMapsUtils
import UIKit

final class MapHeatmapBuilder {
  func build(_ h: RNHeatmap) -> GMUHeatmapTileLayer {
    let heatmap = GMUHeatmapTileLayer()
    heatmap.weightedData = h.weightedData.toWeightedLatLngs()

    h.radius.map { heatmap.radius = UInt($0) }
    h.opacity.map { heatmap.opacity = Float($0) }
    h.zIndex.map { heatmap.zIndex = Int32($0) }
    h.gradient.map { heatmap.gradient = toGMUGradient($0) }

    return heatmap
  }

  func update(_ prev: RNHeatmap, _ next: RNHeatmap, _ heatmap: GMUHeatmapTileLayer) {
    onMain {
      var tilesDirty = false

      if !prev.weightedDataEquals(next) {
        heatmap.weightedData = next.weightedData.toWeightedLatLngs()
        tilesDirty = true
      }

      if prev.radius != next.radius {
        next.radius.map { heatmap.radius = UInt($0) }
        tilesDirty = true
      }

      if prev.opacity != next.opacity {
        next.opacity.map { heatmap.opacity = Float($0) }
      }

      if !prev.gradientEquals(next) {
        next.gradient.map { heatmap.gradient = self.toGMUGradient($0) }
        tilesDirty = true
      }

      if prev.zIndex != next.zIndex {
        heatmap.zIndex = Int32(next.zIndex ?? 0)
      }

      if tilesDirty {
        heatmap.clearTileCache()
      }
    }
  }

  private func toGMUGradient(_ g: RNHeatmapGradient) -> GMUGradient {
    GMUGradient(
      colors: g.colors.map { $0.toUIColor() },
      startPoints: g.startPoints.map { NSNumber(value: $0) },
      colorMapSize: UInt(g.colorMapSize)
    )
  }
}
