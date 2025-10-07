import CoreLocation
import GoogleMaps
import UIKit

final class GoogleMapsViewImpl: UIView, GMSMapViewDelegate {

  private let locationHandler: LocationHandler
  private let markerBuilder: MapMarkerBuilder
  private var mapView: GMSMapView?
  private var initialized = false
  private var mapReady = false

  private var pendingMarkers: [(id: String, marker: GMSMarker)] = []
  private var pendingPolylines: [(id: String, polyline: GMSPolyline)] = []
  private var pendingPolygons: [(id: String, polygon: GMSPolygon)] = []
  private var pendingCircles: [(id: String, circle: GMSCircle)] = []

  private var markersById: [String: GMSMarker] = [:]
  private var polylinesById: [String: GMSPolyline] = [:]
  private var polygonsById: [String: GMSPolygon] = [:]
  private var circlesById: [String: GMSCircle] = [:]

  private var cameraMoveReasonIsGesture: Bool = false
  private var lastSubmittedCameraPosition: GMSCameraPosition?
  private var lastSubmittedLocation: CLLocation?

  init(
    frame: CGRect = .zero,
    locationHandler: LocationHandler,
    markerBuilder: MapMarkerBuilder
  ) {
    self.locationHandler = locationHandler
    self.markerBuilder = markerBuilder
    super.init(frame: frame)
    setupAppLifecycleObservers()
  }

  private func setupAppLifecycleObservers() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appDidEnterBackground),
      name: UIApplication.didEnterBackgroundNotification,
      object: nil
    )
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  @MainActor
  func initMapView(mapId: String?, liteMode: Bool?, camera: GMSCameraPosition?) {
    if initialized { return }
    initialized = true
    let options = GMSMapViewOptions()
    options.frame = bounds
    if let mapId = mapId {
      options.mapID = GMSMapID(identifier: mapId)
    }
    if let liteMode = liteMode {
      /// not supported
    }
    if let camera = camera {
      options.camera = camera
    }
    mapView = GMSMapView.init(options: options)
    mapView?.delegate = self
    mapView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    mapView?.paddingAdjustmentBehavior = .never
    if let mapView = mapView {
      addSubview(mapView)
    }
    initLocationCallbacks()
    applyPending()
    onMapReady?(true)
    mapReady = true
  }

  private func initLocationCallbacks() {
    locationHandler.onUpdate = { [weak self] loc in
      guard let self = self else { return }
      if self.lastSubmittedLocation?.coordinate.latitude
        != loc.coordinate.latitude
        || self.lastSubmittedLocation?.coordinate.longitude
        != loc.coordinate.longitude {
        self.onLocationUpdate?(
          RNLocation(
            RNLatLng(
              latitude: loc.coordinate.latitude,
              longitude: loc.coordinate.longitude
            ),
            loc.course
          )
        )
      }
      self.lastSubmittedLocation = loc
    }
    locationHandler.onError = { [weak self] error in
      self?.onLocationError?(error)
    }
    locationHandler.start()
  }

  @MainActor
  private func applyPending() {

    if let padding = mapPadding {
      mapView?.padding = UIEdgeInsets(
        top: padding.top,
        left: padding.left,
        bottom: padding.bottom,
        right: padding.right
      )
    }

    if let uiSettings = uiSettings {
      if let allGesturesEnabled = uiSettings.allGesturesEnabled {
        mapView?.settings.setAllGesturesEnabled(allGesturesEnabled)
      }
      if let compassEnabled = uiSettings.compassEnabled {
        mapView?.settings.compassButton = compassEnabled
      }
      if let indoorLevelPickerEnabled = uiSettings.indoorLevelPickerEnabled {
        mapView?.settings.indoorPicker = indoorLevelPickerEnabled
      }
      if let mapToolbarEnabled = uiSettings.mapToolbarEnabled {
        /// not supported
      }
      if let myLocationButtonEnabled = uiSettings.myLocationButtonEnabled {
        mapView?.settings.myLocationButton = myLocationButtonEnabled
      }
      if let rotateEnabled = uiSettings.rotateEnabled {
        mapView?.settings.rotateGestures = rotateEnabled
      }
      if let scrollEnabled = uiSettings.scrollEnabled {
        mapView?.settings.scrollGestures = scrollEnabled
      }
      if let scrollDuringRotateOrZoomEnabled = uiSettings
        .scrollDuringRotateOrZoomEnabled {
        mapView?.settings.allowScrollGesturesDuringRotateOrZoom =
          scrollDuringRotateOrZoomEnabled
      }
      if let tiltEnabled = uiSettings.tiltEnabled {
        mapView?.settings.tiltGestures = tiltEnabled
      }
      if let zoomControlsEnabled = uiSettings.zoomControlsEnabled {
        /// not supported
      }
      if let zoomGesturesEnabled = uiSettings.zoomGesturesEnabled {
        mapView?.settings.zoomGestures = zoomGesturesEnabled
      }
    }

    if let myLocation = myLocationEnabled {
      mapView?.isMyLocationEnabled = myLocation
    }

    if let buildings = buildingEnabled {
      mapView?.isBuildingsEnabled = buildings
    }

    if let traffic = trafficEnabled {
      mapView?.isTrafficEnabled = traffic
    }

    if let indoor = indoorEnabled {
      mapView?.isIndoorEnabled = indoor
    }

    if let style = customMapStyle {
      mapView?.mapStyle = style
    }

    if let mapType = mapType {
      mapView?.mapType = mapType
    }

    if let uiStyle = userInterfaceStyle {
      mapView?.overrideUserInterfaceStyle = uiStyle
    }

    if let minZoom = minZoomLevel, let maxZoom = maxZoomLevel {
      mapView?.setMinZoom(Float(minZoom), maxZoom: Float(maxZoom))
    }

    if let locationConfig = locationConfig {
      locationHandler.desiredAccuracy =
        locationConfig.ios?.desiredAccuracy?.toCLLocationAccuracy
      locationHandler.distanceFilterMeters =
        locationConfig.ios?.distanceFilterMeters
    }

    if !pendingMarkers.isEmpty {
      pendingMarkers.forEach {
        addMarkerInternal(id: $0.id, marker: $0.marker)
      }
      pendingMarkers.removeAll()
    }
    if !pendingPolylines.isEmpty {
      pendingPolylines.forEach {
        addPolylineInternal(id: $0.id, polyline: $0.polyline)
      }
      pendingPolylines.removeAll()
    }
    if !pendingPolygons.isEmpty {
      pendingPolygons.forEach {
        addPolygonInternal(id: $0.id, polygon: $0.polygon)
      }
      pendingPolygons.removeAll()
    }
    if !pendingCircles.isEmpty {
      pendingCircles.forEach {
        addCircleInternal(id: $0.id, circle: $0.circle)
      }
      pendingCircles.removeAll()
    }
  }

  var currentCamera: GMSCameraPosition? {
    mapView?.camera
  }

  @MainActor
  var uiSettings: RNMapUiSettings? {
    didSet {
      guard let mapView = mapView else { return }
      let settings = mapView.settings

      if let v = uiSettings {
        if let allGesturesEnabled = v.allGesturesEnabled {
          settings.setAllGesturesEnabled(allGesturesEnabled)
        }
        if let compassEnabled = v.compassEnabled {
          settings.compassButton = compassEnabled
        }
        if let indoorLevelPickerEnabled = v.indoorLevelPickerEnabled {
          settings.indoorPicker = indoorLevelPickerEnabled
        }
        if let mapToolbarEnabled = v.mapToolbarEnabled {
          /// not supported
        }
        if let myLocationButtonEnabled = v.myLocationButtonEnabled {
          settings.myLocationButton = myLocationButtonEnabled
        }
        if let rotateEnabled = v.rotateEnabled {
          settings.rotateGestures = rotateEnabled
        }
        if let scrollEnabled = v.scrollEnabled {
          settings.scrollGestures = scrollEnabled
        }
        if let scrollDuringRotateOrZoomEnabled = v
          .scrollDuringRotateOrZoomEnabled {
          settings.allowScrollGesturesDuringRotateOrZoom =
            scrollDuringRotateOrZoomEnabled
        }
        if let tiltEnabled = v.tiltEnabled {
          settings.tiltGestures = tiltEnabled
        }
        if let zoomControlsEnabled = v.zoomControlsEnabled {
          /// not supported
        }
        if let zoomGesturesEnabled = v.zoomGesturesEnabled {
          settings.zoomGestures = zoomGesturesEnabled
        }
      } else {
        settings.setAllGesturesEnabled(true)
        settings.compassButton = false
        settings.indoorPicker = false
        settings.myLocationButton = false
        settings.rotateGestures = true
        settings.scrollGestures = true
        settings.allowScrollGesturesDuringRotateOrZoom = true
        settings.tiltGestures = true
        settings.zoomGestures = false
      }
    }
  }

  @MainActor
  var myLocationEnabled: Bool? {
    didSet {
      if let value = myLocationEnabled {
        mapView?.isMyLocationEnabled = value
      } else {
        mapView?.isMyLocationEnabled = false
      }
    }
  }

  @MainActor
  var buildingEnabled: Bool? {
    didSet {
      if let value = buildingEnabled {
        mapView?.isBuildingsEnabled = value
      } else {
        mapView?.isBuildingsEnabled = false
      }
    }
  }

  @MainActor
  var trafficEnabled: Bool? {
    didSet {
      if let value = trafficEnabled {
        mapView?.isTrafficEnabled = value
      } else {
        mapView?.isTrafficEnabled = false
      }
    }
  }

  @MainActor
  var indoorEnabled: Bool? {
    didSet {
      if let value = indoorEnabled {
        mapView?.isIndoorEnabled = value
      } else {
        mapView?.isIndoorEnabled = false
      }
    }
  }

  @MainActor
  var customMapStyle: GMSMapStyle? {
    didSet {
      if let style = customMapStyle {
        mapView?.mapStyle = style
      }
    }
  }

  @MainActor
  var userInterfaceStyle: UIUserInterfaceStyle? {
    didSet {
      if let style = userInterfaceStyle {
        mapView?.overrideUserInterfaceStyle = style
      }
    }
  }

  @MainActor
  var minZoomLevel: Double? {
    didSet {
      if let min = minZoomLevel, let max = maxZoomLevel {
        mapView?.setMinZoom(Float(min), maxZoom: Float(max))
      }
    }
  }

  @MainActor
  var maxZoomLevel: Double? {
    didSet {
      if let max = maxZoomLevel, let min = minZoomLevel {
        mapView?.setMinZoom(Float(min), maxZoom: Float(max))
      }
    }
  }

  @MainActor
  var mapPadding: RNMapPadding? {
    didSet {
      if let padding = mapPadding {
        mapView?.padding = UIEdgeInsets(
          top: padding.top,
          left: padding.left,
          bottom: padding.bottom,
          right: padding.right
        )
      } else {
        mapView?.padding = .zero
      }
    }
  }

  @MainActor var mapType: GMSMapViewType? {
    didSet {
      mapView?.mapType = mapType ?? .normal
    }
  }

  @MainActor var locationConfig: RNLocationConfig? {
    didSet {
      locationHandler.desiredAccuracy =
        locationConfig?.ios?.desiredAccuracy?.toCLLocationAccuracy
      locationHandler.distanceFilterMeters =
        locationConfig?.ios?.distanceFilterMeters
    }
  }

  var onMapError: ((RNMapErrorCode) -> Void)?
  var onMapReady: ((Bool) -> Void)?
  var onLocationUpdate: ((RNLocation) -> Void)?
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)?
  var onMapPress: ((RNLatLng) -> Void)?
  var onMarkerPress: ((String) -> Void)?
  var onPolylinePress: ((String) -> Void)?
  var onPolygonPress: ((String) -> Void)?
  var onCirclePress: ((String) -> Void)?
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)?

  func setCamera(camera: GMSCameraPosition, animated: Bool, durationMS: Double) {
    if animated {
      withCATransaction(
        disableActions: false,
        duration: durationMS / 1000.0
      ) {
        mapView?.animate(to: camera)
      }
    } else {
      let update = GMSCameraUpdate.setCamera(camera)
      mapView?.moveCamera(update)
    }
  }

  func setCameraToCoordinates(
    coordinates: [RNLatLng],
    padding: RNMapPadding,
    animated: Bool,
    durationMS: Double
  ) {
    if coordinates.isEmpty {
      return
    }
    var bounds = GMSCoordinateBounds(
      coordinate: CLLocationCoordinate2D(
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude
      ),
      coordinate: CLLocationCoordinate2D(
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude
      )
    )

    for coord in coordinates.dropFirst() {
      bounds = bounds.includingCoordinate(
        CLLocationCoordinate2D(
          latitude: coord.latitude,
          longitude: coord.longitude
        )
      )
    }

    let insets = UIEdgeInsets(
      top: padding.top,
      left: padding.left,
      bottom: padding.bottom,
      right: padding.right
    )

    let update = GMSCameraUpdate.fit(bounds, with: insets)
    if animated {
      withCATransaction(
        disableActions: false,
        duration: durationMS / 1000.0
      ) {
        mapView?.animate(with: update)
      }
    } else {
      mapView?.moveCamera(update)
    }
  }

  @MainActor
  func addMarker(id: String, marker: GMSMarker) {
    if mapView == nil {
      pendingMarkers.append((id, marker))
      return
    }
    if let old = markersById.removeValue(forKey: id) { old.map = nil }
    addMarkerInternal(id: id, marker: marker)
  }

  @MainActor
  private func addMarkerInternal(id: String, marker: GMSMarker) {
    marker.userData = id
    marker.map = mapView
    markersById[id] = marker
  }

  @MainActor
  func updateMarker(id: String, block: @escaping (GMSMarker) -> Void) {
    guard let m = markersById[id] else { return }
    block(m)
  }

  @MainActor
  func removeMarker(id: String) {
    if let m = markersById.removeValue(forKey: id) { m.map = nil }
  }

  @MainActor
  func clearMarkers() {
    markersById.values.forEach { $0.map = nil }
    markersById.removeAll()
    pendingMarkers.removeAll()
  }

  @MainActor
  func addPolyline(id: String, polyline: GMSPolyline) {
    if mapView == nil {
      pendingPolylines.append((id, polyline))
      return
    }
    if let old = polylinesById.removeValue(forKey: id) { old.map = nil }
    addPolylineInternal(id: id, polyline: polyline)
  }

  @MainActor
  private func addPolylineInternal(id: String, polyline: GMSPolyline) {
    polyline.map = mapView
    polyline.userData = id
    polylinesById[id] = polyline
  }

  @MainActor
  func updatePolyline(id: String, block: @escaping (GMSPolyline) -> Void) {
    guard let pl = polylinesById[id] else { return }
    block(pl)
  }

  @MainActor
  func removePolyline(id: String) {
    if let pl = polylinesById.removeValue(forKey: id) { pl.map = nil }
  }

  @MainActor
  func clearPolylines() {
    polylinesById.values.forEach { $0.map = nil }
    polylinesById.removeAll()
    pendingPolylines.removeAll()
  }

  @MainActor
  func addPolygon(id: String, polygon: GMSPolygon) {
    if mapView == nil {
      pendingPolygons.append((id, polygon))
      return
    }
    if let old = polygonsById.removeValue(forKey: id) { old.map = nil }
    addPolygonInternal(id: id, polygon: polygon)
  }

  @MainActor
  private func addPolygonInternal(id: String, polygon: GMSPolygon) {
    polygon.map = mapView
    polygon.userData = id
    polygonsById[id] = polygon
  }

  @MainActor
  func updatePolygon(id: String, block: @escaping (GMSPolygon) -> Void) {
    guard let pg = polygonsById[id] else { return }
    block(pg)
  }

  @MainActor
  func removePolygon(id: String) {
    if let pg = polygonsById.removeValue(forKey: id) { pg.map = nil }
  }

  @MainActor
  func clearPolygons() {
    polygonsById.values.forEach { $0.map = nil }
    polygonsById.removeAll()
    pendingPolygons.removeAll()
  }

  @MainActor
  func addCircle(id: String, circle: GMSCircle) {
    if mapView == nil {
      pendingCircles.append((id, circle))
      return
    }
    if let old = circlesById.removeValue(forKey: id) { old.map = nil }
    addCircleInternal(id: id, circle: circle)
  }

  @MainActor
  private func addCircleInternal(id: String, circle: GMSCircle) {
    circle.map = mapView
    circle.userData = id
    circlesById[id] = circle
  }

  @MainActor
  func updateCircle(id: String, block: @escaping (GMSCircle) -> Void) {
    guard let circle = circlesById[id] else { return }
    block(circle)
  }

  @MainActor
  func removeCircle(id: String) {
    if let circle = circlesById.removeValue(forKey: id) { circle.map = nil }
  }

  @MainActor
  func clearCircles() {
    circlesById.values.forEach { $0.map = nil }
    circlesById.removeAll()
    pendingCircles.removeAll()
  }

  func deinitInternal() {
    markerBuilder.cancelAllIconTasks()
    clearMarkers()
    clearPolylines()
    clearPolygons()
    clearCircles()
    locationHandler.stop()
    mapView?.clear()
    mapView?.delegate = nil
    mapView = nil
  }

  @objc private func appDidBecomeActive() {
    if window != nil {
      locationHandler.start()
    }
  }

  @objc private func appDidEnterBackground() {
    locationHandler.stop()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      if mapView != nil && mapReady {
        onMapReady?(true)
      }
      locationHandler.start()
    } else {
      locationHandler.stop()
    }
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    deinitInternal()
  }

  func mapView(_ mapView: GMSMapView, willMove gesture: Bool) {
    let visibleRegion = mapView.projection.visibleRegion()
    let bounds = GMSCoordinateBounds(region: visibleRegion)

    let center = CLLocationCoordinate2D(
      latitude: (bounds.northEast.latitude + bounds.southWest.latitude) / 2.0,
      longitude: (bounds.northEast.longitude + bounds.southWest.longitude) / 2.0
    )

    let latDelta = bounds.northEast.latitude - bounds.southWest.latitude
    let lngDelta = bounds.northEast.longitude - bounds.southWest.longitude

    let cp = mapView.camera
    let region = RNRegion(
      center: RNLatLng(center.latitude, center.longitude),
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    )
    let cam = RNCamera(
      center: RNLatLng(
        latitude: cp.target.latitude,
        longitude: cp.target.longitude
      ),
      zoom: Double(cp.zoom),
      bearing: cp.bearing,
      tilt: cp.viewingAngle
    )
    cameraMoveReasonIsGesture = gesture

    onCameraChangeStart?(region, cam, gesture)
  }

  func mapView(_ mapView: GMSMapView, didChange position: GMSCameraPosition) {
    if let last = lastSubmittedCameraPosition,
       last.target.latitude == position.target.latitude,
       last.target.longitude == position.target.longitude,
       last.zoom == position.zoom,
       last.bearing == position.bearing,
       last.viewingAngle == position.viewingAngle {
      return
    }
    let visibleRegion = mapView.projection.visibleRegion()
    let bounds = GMSCoordinateBounds(region: visibleRegion)

    let center = CLLocationCoordinate2D(
      latitude: (bounds.northEast.latitude + bounds.southWest.latitude) / 2.0,
      longitude: (bounds.northEast.longitude + bounds.southWest.longitude) / 2.0
    )

    let latDelta = bounds.northEast.latitude - bounds.southWest.latitude
    let lngDelta = bounds.northEast.longitude - bounds.southWest.longitude

    let cp = mapView.camera
    let region = RNRegion(
      center: RNLatLng(center.latitude, center.longitude),
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    )
    let cam = RNCamera(
      center: RNLatLng(
        latitude: cp.target.latitude,
        longitude: cp.target.longitude
      ),
      zoom: Double(cp.zoom),
      bearing: cp.bearing,
      tilt: cp.viewingAngle
    )
    onCameraChange?(region, cam, cameraMoveReasonIsGesture)
    lastSubmittedCameraPosition = position
  }

  func mapView(_ mapView: GMSMapView, idleAt position: GMSCameraPosition) {
    let visibleRegion = mapView.projection.visibleRegion()
    let bounds = GMSCoordinateBounds(region: visibleRegion)

    let center = CLLocationCoordinate2D(
      latitude: (bounds.northEast.latitude + bounds.southWest.latitude) / 2.0,
      longitude: (bounds.northEast.longitude + bounds.southWest.longitude) / 2.0
    )

    let latDelta = bounds.northEast.latitude - bounds.southWest.latitude
    let lngDelta = bounds.northEast.longitude - bounds.southWest.longitude

    let cp = mapView.camera
    let region = RNRegion(
      center: RNLatLng(center.latitude, center.longitude),
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    )
    let cam = RNCamera(
      center: RNLatLng(
        latitude: cp.target.latitude,
        longitude: cp.target.longitude
      ),
      zoom: Double(cp.zoom),
      bearing: cp.bearing,
      tilt: cp.viewingAngle
    )
    onCameraChangeComplete?(region, cam, cameraMoveReasonIsGesture)
  }

  func mapView(
    _ mapView: GMSMapView,
    didTapAt coordinate: CLLocationCoordinate2D
  ) {
    onMapPress?(
      RNLatLng(
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      )
    )
  }

  func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool {
    let id = (marker.userData as? String) ?? "unknown"
    onMarkerPress?(id)
    return true
  }

  func mapView(_ mapView: GMSMapView, didTap overlay: GMSOverlay) {
    switch overlay {
    case let circle as GMSCircle:
      let id = (circle.userData as? String) ?? "unknown"
      onCirclePress?(id)

    case let polygon as GMSPolygon:
      let id = (polygon.userData as? String) ?? "unknown"
      onPolygonPress?(id)

    case let polyline as GMSPolyline:
      let id = (polyline.userData as? String) ?? "unknown"
      onPolylinePress?(id)

    default:
      break
    }
  }
}
