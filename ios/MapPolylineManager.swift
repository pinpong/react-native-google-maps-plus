import GoogleMaps

private final class PolylineState {
  var current: RNPolyline
  var polyline: GMSPolyline?

  init(current: RNPolyline) {
    self.current = current
  }
}

final class MapPolylineManager {
  private let builder: MapPolylineBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: PolylineState] = [:]
  private var destroyed = false

  init(builder: MapPolylineBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.polyline == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ polyline: RNPolyline) {
    onMain {
      guard !self.destroyed else { return }
      self.states.removeValue(forKey: polyline.id).map { self.removeFromMap($0) }
      let state = PolylineState(current: polyline)
      self.states[polyline.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNPolyline) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.polylineEquals(next) { return }
      state.current = next
      state.polyline.map { self.builder.update(prev, next, $0) }
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

  private func addToMap(_ state: PolylineState) {
    guard let mapView = self.mapView else { return }
    let polyline = self.builder.build(state.current)
    polyline.tagData = PolylineTag(id: state.current.id)
    polyline.map = mapView
    state.polyline = polyline
  }

  private func removeFromMap(_ state: PolylineState) {
    state.polyline?.map = nil
  }
}
