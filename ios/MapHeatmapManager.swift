import GoogleMaps
import GoogleMapsUtils

private final class HeatmapState {
  var current: RNHeatmap
  var overlay: GMUHeatmapTileLayer?

  init(current: RNHeatmap) {
    self.current = current
  }
}

final class MapHeatmapManager {
  private let builder: MapHeatmapBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: HeatmapState] = [:]
  private var destroyed = false

  init(builder: MapHeatmapBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.overlay == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ heatmap: RNHeatmap) {
    onMain {
      guard !self.destroyed else { return }
      self.remove(id: heatmap.id)
      let state = HeatmapState(current: heatmap)
      self.states[heatmap.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNHeatmap) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.heatmapEquals(next) { return }
      state.current = next
      guard let overlay = state.overlay else { return }
      if prev.heatmapNeedsRebuild(next) {
        self.removeFromMap(state)
        self.addToMap(state)
      } else {
        self.builder.update(prev, next, overlay)
      }
    }
  }

  func remove(id: String) {
    onMain {
      self.states.removeValue(forKey: id).map { self.removeFromMap($0) }
    }
  }

  func destroy() {
    onMain {
      self.destroyed = true
      self.states.values.forEach { self.removeFromMap($0) }
      self.states.removeAll()
      self.mapView = nil
    }
  }

  private func addToMap(_ state: HeatmapState) {
    guard let mapView = self.mapView else { return }
    let overlay = self.builder.build(state.current)
    overlay.map = mapView
    state.overlay = overlay
  }

  private func removeFromMap(_ state: HeatmapState) {
    state.overlay.map {
      $0.clearTileCache()
      $0.map = nil
    }
  }
}
