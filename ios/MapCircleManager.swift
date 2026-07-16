import GoogleMaps

private final class CircleState {
  var current: RNCircle
  var circle: GMSCircle?

  init(current: RNCircle) {
    self.current = current
  }
}

final class MapCircleManager {
  private let builder: MapCircleBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: CircleState] = [:]
  private var destroyed = false

  init(builder: MapCircleBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.circle == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ circle: RNCircle) {
    onMain {
      guard !self.destroyed else { return }
      self.states.removeValue(forKey: circle.id).map { self.removeFromMap($0) }
      let state = CircleState(current: circle)
      self.states[circle.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNCircle) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.circleEquals(next) { return }
      state.current = next
      state.circle.map { self.builder.update(prev, next, $0) }
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

  private func addToMap(_ state: CircleState) {
    guard let mapView = self.mapView else { return }
    let circle = self.builder.build(state.current)
    circle.tagData = CircleTag(id: state.current.id)
    circle.map = mapView
    state.circle = circle
  }

  private func removeFromMap(_ state: CircleState) {
    state.circle?.map = nil
  }
}
