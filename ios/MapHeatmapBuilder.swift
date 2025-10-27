import Foundation
import GoogleMaps
import GoogleMapsUtils
import UIKit

final class MapHeatmapBuilder {
  @MainActor
  func build(_ h: RNHeatmap) -> GMUHeatmapTileLayer {
    let heatmap = GMUHeatmapTileLayer()
    heatmap.weightedData = h.weightedData.toWeightedLatLngs()

    h.radius.map { heatmap.radius = UInt($0) }
    h.opacity.map { heatmap.opacity = Float($0) }
    h.zIndex.map { heatmap.zIndex = Int32($0) }

    h.gradient.map { g in
      let colors = g.colors.map { $0.toUIColor() }
      let startPoints = g.startPoints.map { NSNumber(value: $0) }
      heatmap.gradient = GMUGradient(
        colors: colors,
        startPoints: startPoints,
        colorMapSize: UInt(g.colorMapSize)
      )
    }

    return heatmap
  }
}
