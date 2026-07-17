import GoogleMaps
import UIKit

private final class MarkerState {
  var current: RNMarker
  var marker: GMSMarker?
  var currentToken: UInt64 = 0
  var appliedIcon: UIImage?
  var iconReady = false
  var anchorsDeferred = false
  var appliedStyleHash: NSNumber?
  var renderingStyleHash: NSNumber?
  var renderTask: Task<Void, Never>?

  init(current: RNMarker) {
    self.current = current
  }
}

final class MapMarkerManager {
  private let builder: MapMarkerBuilder
  private weak var mapView: GMSMapView?
  private var states: [String: MarkerState] = [:]
  private var iconGeneration: UInt64 = 0
  private var destroyed = false

  init(builder: MapMarkerBuilder) {
    self.builder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.states.values
        .filter { $0.marker == nil && $0.iconReady && $0.renderTask == nil }
        .forEach { self.addToMap($0) }
    }
  }

  func add(_ marker: RNMarker) {
    onMain {
      guard !self.destroyed else { return }
      self.remove(id: marker.id)
      let state = MarkerState(current: marker)
      self.states[marker.id] = state
      self.requestIcon(for: state)
    }
  }

  func update(_ next: RNMarker) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.states[next.id] else { return }
      let prev = state.current
      if prev.markerEquals(next) { return }
      state.current = next

      let nextStyleHash: NSNumber? = next.iconSvg != nil ? next.styleHash() : nil
      let renderingSameStyle = state.renderTask != nil && state.renderingStyleHash == nextStyleHash
      let iconUpToDate = state.renderTask == nil && state.iconReady && state.appliedStyleHash == nextStyleHash
      let needsRender = !renderingSameStyle && !iconUpToDate
      let deferAnchors = needsRender || state.renderTask != nil
      if deferAnchors, !prev.anchorEquals(next) || !prev.infoWindowAnchorEquals(next) {
        state.anchorsDeferred = true
      }

      state.marker.map { marker in
        self.builder.update(prev, next, marker, deferAnchors: deferAnchors)
        guard let mapView = self.mapView, mapView.selectedMarker == marker,
              !prev.infoWindowContentEquals(next) else { return }

        if next.infoWindowIsEmpty() {
          self.hideInfoWindow(id: next.id)
        } else if prev.infoWindowIconSvg != nil || next.infoWindowIconSvg != nil {
          self.showInfoWindow(id: next.id)
        } else {
          marker.tracksInfoWindowChanges = true
          marker.tracksInfoWindowChanges = false
        }
      }

      if needsRender { self.requestIcon(for: state) }
    }
  }

  func remove(id: String) {
    onMain {
      self.states.removeValue(forKey: id).map { self.removeFromMap($0) }
    }
  }

  func showInfoWindow(id: String) {
    onMain {
      guard let mapView = self.mapView,
            let marker = self.states[id]?.marker else { return }
      mapView.selectedMarker = marker
    }
  }

  func hideInfoWindow(id: String) {
    onMain {
      guard let mapView = self.mapView,
            let marker = self.states[id]?.marker else { return }
      if mapView.selectedMarker == marker {
        mapView.selectedMarker = nil
      }
    }
  }

  func infoWindowView(markerTag: MarkerTag) -> UIImageView? {
    builder.buildInfoWindow(markerTag: markerTag)
  }

  func clearIconCache() {
    builder.clearIconCache()
  }

  func destroy() {
    onMain {
      self.destroyed = true
      self.states.values.forEach { self.removeFromMap($0) }
      self.states.removeAll()
      self.builder.clearIconCache()
      self.mapView = nil
      CATransaction.flush()
    }
  }

  private func requestIcon(for state: MarkerState) {
    state.renderTask?.cancel()
    state.renderTask = nil
    iconGeneration += 1
    let token = iconGeneration
    state.currentToken = token
    let id = state.current.id

    guard let iconSvg = state.current.iconSvg else {
      state.renderingStyleHash = nil
      applyIcon(id: id, token: token, icon: nil)
      return
    }

    let styleHash = state.current.styleHash()
    if let cached = builder.cachedIcon(styleHash: styleHash) {
      state.renderingStyleHash = nil
      applyIcon(id: id, token: token, icon: cached)
      return
    }

    state.renderingStyleHash = styleHash
    state.renderTask = builder.renderIcon(
      markerId: id,
      iconSvg: iconSvg,
      styleHash: styleHash
    ) { [weak self] icon in
      self?.applyIcon(id: id, token: token, icon: icon)
    }
  }

  private func applyIcon(id: String, token: UInt64, icon: UIImage?) {
    guard let state = states[id] else { return }
    guard state.currentToken == token else { return }
    state.renderTask = nil
    state.renderingStyleHash = nil
    state.appliedStyleHash = state.current.iconSvg != nil ? state.current.styleHash() : nil
    state.iconReady = true

    if let marker = state.marker {
      withCATransaction(disableActions: true) {
        marker.tracksViewChanges = true
        marker.icon = icon
        if state.anchorsDeferred {
          self.builder.applyAnchors(state.current, marker)
          state.anchorsDeferred = false
        }
        marker.tracksViewChanges = false
      }
      return
    }

    state.appliedIcon = icon
    if mapView != nil {
      addToMap(state)
    }
  }

  private func addToMap(_ state: MarkerState) {
    let marker = builder.build(state.current, icon: state.appliedIcon)
    marker.map = mapView
    state.marker = marker
    state.appliedIcon = nil
    state.anchorsDeferred = false
  }

  private func removeFromMap(_ state: MarkerState) {
    state.renderTask?.cancel()
    state.marker.map {
      $0.icon = nil
      $0.map = nil
    }
  }
}
