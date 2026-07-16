import GoogleMaps

private final class UrlTileOverlayState {
  var current: RNUrlTileOverlay
  var overlay: GMSURLTileLayer?

  init(current: RNUrlTileOverlay) {
    self.current = current
  }
}

final class MapUrlTileOverlayManager {
  private let builder: MapUrlTileOverlayBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: UrlTileOverlayState] = [:]
  private var destroyed = false

  init(builder: MapUrlTileOverlayBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.overlay == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ urlTileOverlay: RNUrlTileOverlay) {
    onMain {
      guard !self.destroyed else { return }
      self.states.removeValue(forKey: urlTileOverlay.id).map { self.removeFromMap($0) }
      let state = UrlTileOverlayState(current: urlTileOverlay)
      self.states[urlTileOverlay.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNUrlTileOverlay) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.urlTileOverlayEquals(next) { return }
      state.current = next
      guard let overlay = state.overlay else { return }
      if prev.url != next.url || prev.tileSize != next.tileSize {
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

  private func addToMap(_ state: UrlTileOverlayState) {
    guard let mapView = self.mapView else { return }
    let overlay = self.builder.build(state.current)
    overlay.map = mapView
    state.overlay = overlay
  }

  private func removeFromMap(_ state: UrlTileOverlayState) {
    state.overlay.map {
      $0.clearTileCache()
      $0.map = nil
    }
  }
}
