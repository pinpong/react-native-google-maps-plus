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
  private let markerBuilder: MapMarkerBuilder
  private weak var mapView: GMSMapView?
  private var markerStates: [String: MarkerState] = [:]
  private var iconGeneration: UInt64 = 0
  private var destroyed = false

  init(builder: MapMarkerBuilder) {
    self.markerBuilder = builder
  }

  func attachMap(_ mapView: GMSMapView) {
    onMain {
      guard !self.destroyed else { return }
      self.mapView = mapView
      self.markerStates.values
        .filter { $0.marker == nil && $0.iconReady && $0.renderTask == nil }
        .forEach { self.addToMap($0) }
    }
  }

  func add(_ marker: RNMarker) {
    onMain {
      guard !self.destroyed else { return }
      self.markerStates.removeValue(forKey: marker.id).map { self.removeFromMap($0) }
      let state = MarkerState(current: marker)
      self.markerStates[marker.id] = state
      self.requestIcon(for: state)
    }
  }

  func update(_ next: RNMarker) {
    onMain {
      guard !self.destroyed else { return }
      guard let state = self.markerStates[next.id] else { return }
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
        self.markerBuilder.update(prev, next, marker, deferAnchors: deferAnchors)
        if let mapView = self.mapView, mapView.selectedMarker == marker {
          mapView.selectedMarker = nil
          mapView.selectedMarker = marker
        }
      }

      if needsRender { self.requestIcon(for: state) }
    }
  }

  func remove(id: String) {
    onMain {
      self.markerStates.removeValue(forKey: id).map { self.removeFromMap($0) }
    }
  }

  func showInfoWindow(id: String) {
    onMain {
      guard let marker = self.markerStates[id]?.marker else { return }
      self.mapView?.selectedMarker = nil
      self.mapView?.selectedMarker = marker
    }
  }

  func hideInfoWindow(id: String) {
    onMain {
      guard let marker = self.markerStates[id]?.marker else { return }
      if self.mapView?.selectedMarker == marker {
        self.mapView?.selectedMarker = nil
      }
    }
  }

  func infoWindowView(markerTag: MarkerTag) -> UIImageView? {
    markerBuilder.buildInfoWindow(markerTag: markerTag)
  }

  func clearIconCache() {
    markerBuilder.clearIconCache()
  }

  func cancelAllRenders() {
    onMain {
      self.markerStates.values.forEach { state in
        if state.marker == nil { return }
        state.renderTask?.cancel()
        state.renderTask = nil
        state.renderingStyleHash = nil
      }
      CATransaction.flush()
    }
  }

  func destroy() {
    onMain {
      self.destroyed = true
      self.markerStates.values.forEach { self.removeFromMap($0) }
      self.markerStates.removeAll()
      self.markerBuilder.clearIconCache()
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
    if let cached = markerBuilder.cachedIcon(styleHash: styleHash) {
      state.renderingStyleHash = nil
      applyIcon(id: id, token: token, icon: cached)
      return
    }

    state.renderingStyleHash = styleHash
    state.renderTask = markerBuilder.renderIcon(
      markerId: id,
      iconSvg: iconSvg,
      styleHash: styleHash
    ) { [weak self] icon in
      self?.applyIcon(id: id, token: token, icon: icon)
    }
  }

  private func applyIcon(id: String, token: UInt64, icon: UIImage?) {
    guard let state = markerStates[id] else { return }
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
          self.markerBuilder.applyAnchors(state.current, marker)
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
    let marker = markerBuilder.build(state.current, icon: state.appliedIcon)
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
