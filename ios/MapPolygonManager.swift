import GoogleMaps

private final class PolygonState {
  var current: RNPolygon
  var polygon: GMSPolygon?

  init(current: RNPolygon) {
    self.current = current
  }
}

final class MapPolygonManager {
  private let builder: MapPolygonBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: PolygonState] = [:]
  private var destroyed = false

  init(builder: MapPolygonBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.polygon == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ polygon: RNPolygon) {
    onMain {
      guard !self.destroyed else { return }
      self.states.removeValue(forKey: polygon.id).map { self.removeFromMap($0) }
      let state = PolygonState(current: polygon)
      self.states[polygon.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNPolygon) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.polygonEquals(next) { return }
      state.current = next
      state.polygon.map { self.builder.update(prev, next, $0) }
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

  private func addToMap(_ state: PolygonState) {
    guard let mapView = self.mapView else { return }
    let polygon = self.builder.build(state.current)
    polygon.tagData = PolygonTag(id: state.current.id)
    polygon.map = mapView
    state.polygon = polygon
  }

  private func removeFromMap(_ state: PolygonState) {
    state.polygon?.map = nil
  }
}
