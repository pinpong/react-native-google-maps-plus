import GoogleMaps
import GoogleMapsUtils

private final class KmlLayerState {
  let current: RNKMLayer
  var renderer: GMUGeometryRenderer?

  init(current: RNKMLayer) {
    self.current = current
  }
}

final class MapKmlLayerManager {
  private let mapErrorHandler: MapErrorHandler
  private weak var mapView: GMSMapView?
  private var states: [String: KmlLayerState] = [:]
  private var destroyed = false

  init(mapErrorHandler: MapErrorHandler) {
    self.mapErrorHandler = mapErrorHandler
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values.filter { $0.renderer == nil }.forEach { self.addToMap($0) }
    }
  }

  func add(_ kmlLayer: RNKMLayer) {
    onMain {
      guard !self.destroyed else { return }
      self.remove(id: kmlLayer.id)
      let state = KmlLayerState(current: kmlLayer)
      self.states[kmlLayer.id] = state
      if self.mapView != nil {
        self.addToMap(state)
      }
    }
  }

  func update(_ next: RNKMLayer) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      if state.current.kmlLayerEquals(next) { return }
      self.add(next)
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

  private func addToMap(_ state: KmlLayerState) {
    guard let mapView = self.mapView else { return }
    guard let data = state.current.kmlString.data(using: .utf8) else {
      self.mapErrorHandler.report(RNMapErrorCode.kmlLayerFailed, "kmlLayerId=\(state.current.id) parse failed")
      return
    }
    let parser = GMUKMLParser(data: data)
    parser.parse()
    let renderer = GMUGeometryRenderer(
      map: mapView,
      geometries: parser.placemarks,
      styles: parser.styles,
      styleMaps: parser.styleMaps
    )
    renderer.render()
    state.renderer = renderer
  }

  private func removeFromMap(_ state: KmlLayerState) {
    state.renderer?.clear()
  }
}
