import CoreLocation
import GoogleMaps
import GoogleMapsUtils
import UIKit

final class GoogleMapsViewImpl: UIView, GMSMapViewDelegate,
GMSIndoorDisplayDelegate {

  private let locationHandler: LocationHandler
  private let markerBuilder: MapMarkerBuilder
  private var mapView: GMSMapView?
  private var initialized = false
  private var mapReady = false

  private var pendingMarkers: [(id: String, marker: GMSMarker)] = []
  private var pendingPolylines: [(id: String, polyline: GMSPolyline)] = []
  private var pendingPolygons: [(id: String, polygon: GMSPolygon)] = []
  private var pendingCircles: [(id: String, circle: GMSCircle)] = []
  private var pendingHeatmaps: [(id: String, heatmap: GMUHeatmapTileLayer)] = []
  private var pendingKmlLayers: [(id: String, kmlString: String)] = []

  private var markersById: [String: GMSMarker] = [:]
  private var polylinesById: [String: GMSPolyline] = [:]
  private var polygonsById: [String: GMSPolygon] = [:]
  private var circlesById: [String: GMSCircle] = [:]
  private var heatmapsById: [String: GMUHeatmapTileLayer] = [:]
  private var kmlLayerById: [String: GMUGeometryRenderer] = [:]

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

    mapId.map { options.mapID = GMSMapID(identifier: $0) }
    liteMode.map { _ in /* not supported */ }
    camera.map { options.camera = $0 }

    mapView = GMSMapView.init(options: options)
    mapView?.delegate = self
    mapView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    mapView?.paddingAdjustmentBehavior = .never
    mapView.map { addSubview($0) }
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
    mapPadding.map {
      mapView?.padding = UIEdgeInsets(
        top: $0.top,
        left: $0.left,
        bottom: $0.bottom,
        right: $0.right
      )
    }

    if let v = uiSettings {
      v.allGesturesEnabled.map { mapView?.settings.setAllGesturesEnabled($0) }
      v.compassEnabled.map { mapView?.settings.compassButton = $0 }
      v.indoorLevelPickerEnabled.map { mapView?.settings.indoorPicker = $0 }
      v.mapToolbarEnabled.map { _ in /* not supported */ }
      v.myLocationButtonEnabled.map { mapView?.settings.myLocationButton = $0 }
      v.rotateEnabled.map { mapView?.settings.rotateGestures = $0 }
      v.scrollEnabled.map { mapView?.settings.scrollGestures = $0 }
      v.scrollDuringRotateOrZoomEnabled.map {
        mapView?.settings.allowScrollGesturesDuringRotateOrZoom = $0
      }
      v.tiltEnabled.map { mapView?.settings.tiltGestures = $0 }
      v.zoomControlsEnabled.map { _ in /* not supported */ }
      v.zoomGesturesEnabled.map { mapView?.settings.zoomGestures = $0 }
    }

    myLocationEnabled.map { mapView?.isMyLocationEnabled = $0 }
    buildingEnabled.map { mapView?.isBuildingsEnabled = $0 }
    trafficEnabled.map { mapView?.isTrafficEnabled = $0 }
    indoorEnabled.map {
      mapView?.isIndoorEnabled = $0
      mapView?.indoorDisplay.delegate = $0 == true ? self : nil
    }
    customMapStyle.map { mapView?.mapStyle = $0 }
    mapType.map { mapView?.mapType = $0 }
    userInterfaceStyle.map { mapView?.overrideUserInterfaceStyle = $0 }

    mapZoomConfig.map {
      mapView?.setMinZoom(
        Float($0.min ?? 2),
        maxZoom: Float($0.max ?? 21)
      )
    }

    locationConfig.map {
      locationHandler.desiredAccuracy =
        $0.ios?.desiredAccuracy?.toCLLocationAccuracy
      locationHandler.distanceFilterMeters = $0.ios?.distanceFilterMeters
    }
    if !pendingMarkers.isEmpty {
      pendingMarkers.forEach { addMarkerInternal(id: $0.id, marker: $0.marker) }
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
      pendingCircles.forEach { addCircleInternal(id: $0.id, circle: $0.circle) }
      pendingCircles.removeAll()
    }
    if !pendingHeatmaps.isEmpty {
      pendingHeatmaps.forEach {
        addHeatmapInternal(id: $0.id, heatmap: $0.heatmap)
      }
      pendingHeatmaps.removeAll()
    }
    if !pendingKmlLayers.isEmpty {
      pendingKmlLayers.forEach {
        addKmlLayerInternal(id: $0.id, kmlString: $0.kmlString)
      }
      pendingKmlLayers.removeAll()
    }
  }

  var currentCamera: GMSCameraPosition? {
    mapView?.camera
  }

  @MainActor
  var uiSettings: RNMapUiSettings? {
    didSet {
      mapView?.settings.setAllGesturesEnabled(
        uiSettings?.allGesturesEnabled ?? true
      )
      mapView?.settings.compassButton = uiSettings?.compassEnabled ?? false
      mapView?.settings.indoorPicker =
        uiSettings?.indoorLevelPickerEnabled ?? false
      mapView?.settings.myLocationButton =
        uiSettings?.myLocationButtonEnabled ?? false
      mapView?.settings.rotateGestures = uiSettings?.rotateEnabled ?? true
      mapView?.settings.scrollGestures = uiSettings?.scrollEnabled ?? true
      mapView?.settings.allowScrollGesturesDuringRotateOrZoom =
        uiSettings?.scrollDuringRotateOrZoomEnabled ?? true
      mapView?.settings.tiltGestures = uiSettings?.tiltEnabled ?? true
      mapView?.settings.zoomGestures = uiSettings?.zoomGesturesEnabled ?? false
    }
  }

  @MainActor
  var myLocationEnabled: Bool? {
    didSet {
      mapView?.isMyLocationEnabled = myLocationEnabled ?? false
    }
  }

  @MainActor
  var buildingEnabled: Bool? {
    didSet {
      mapView?.isBuildingsEnabled = buildingEnabled ?? false
    }
  }

  @MainActor
  var trafficEnabled: Bool? {
    didSet {
      mapView?.isTrafficEnabled = false
    }
  }

  @MainActor
  var indoorEnabled: Bool? {
    didSet {
      mapView?.isIndoorEnabled = indoorEnabled ?? false
      mapView?.indoorDisplay.delegate = indoorEnabled == true ? self : nil
    }
  }

  @MainActor
  var customMapStyle: GMSMapStyle? {
    didSet {
      mapView?.mapStyle = customMapStyle
    }
  }

  @MainActor
  var userInterfaceStyle: UIUserInterfaceStyle? {
    didSet {
      mapView?.overrideUserInterfaceStyle = userInterfaceStyle ?? .unspecified
    }
  }

  @MainActor
  var mapZoomConfig: RNMapZoomConfig? {
    didSet {
      mapView?.setMinZoom(
        Float(mapZoomConfig?.min ?? 2),
        maxZoom: Float(mapZoomConfig?.max ?? 21)
      )
    }
  }

  @MainActor var mapPadding: RNMapPadding? {
    didSet {
      mapView?.padding =
        mapPadding.map {
          UIEdgeInsets(
            top: $0.top,
            left: $0.left,
            bottom: $0.bottom,
            right: $0.right
          )
        } ?? .zero
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
  var onMarkerPress: ((String?) -> Void)?
  var onPolylinePress: ((String?) -> Void)?
  var onPolygonPress: ((String?) -> Void)?
  var onCirclePress: ((String?) -> Void)?
  var onMarkerDragStart: ((String?, RNLatLng) -> Void)?
  var onMarkerDrag: ((String?, RNLatLng) -> Void)?
  var onMarkerDragEnd: ((String?, RNLatLng) -> Void)?
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Void)?
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Void)?
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
    markersById.removeValue(forKey: id).map { $0.map = nil }
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
    markersById[id].map { block($0) }
  }

  @MainActor
  func removeMarker(id: String) {
    markersById.removeValue(forKey: id).map { $0.map = nil }
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
    polylinesById.removeValue(forKey: id).map { $0.map = nil }
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
    polylinesById[id].map { block($0) }
  }

  @MainActor
  func removePolyline(id: String) {
    polylinesById.removeValue(forKey: id).map { $0.map = nil }
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
    polygonsById.removeValue(forKey: id).map { $0.map = nil }
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
    polygonsById[id].map { block($0) }
  }

  @MainActor
  func removePolygon(id: String) {
    polygonsById.removeValue(forKey: id).map { $0.map = nil }
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
    circlesById.removeValue(forKey: id).map { $0.map = nil }
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
    circlesById[id].map { block($0) }
  }

  @MainActor
  func removeCircle(id: String) {
    circlesById.removeValue(forKey: id).map { $0.map = nil }
  }

  @MainActor
  func clearCircles() {
    circlesById.values.forEach { $0.map = nil }
    circlesById.removeAll()
    pendingCircles.removeAll()
  }

  @MainActor
  func addHeatmap(id: String, heatmap: GMUHeatmapTileLayer) {
    if mapView == nil {
      pendingHeatmaps.append((id, heatmap))
      return
    }
    heatmapsById.removeValue(forKey: id).map { $0.map = nil }
    addHeatmapInternal(id: id, heatmap: heatmap)
  }

  @MainActor
  private func addHeatmapInternal(id: String, heatmap: GMUHeatmapTileLayer) {
    heatmap.map = mapView
    heatmapsById[id] = heatmap
  }

  @MainActor
  func removeHeatmap(id: String) {
    heatmapsById.removeValue(forKey: id).map { $0.map = nil }
  }

  @MainActor
  func clearHeatmaps() {
    heatmapsById.values.forEach { $0.map = nil }
    heatmapsById.removeAll()
    pendingHeatmaps.removeAll()
  }

  @MainActor
  func addKmlLayer(id: String, kmlString: String) {
    if mapView == nil {
      pendingKmlLayers.append((id, kmlString))
      return
    }
    kmlLayerById.removeValue(forKey: id).map { $0.clear() }
    addKmlLayerInternal(id: id, kmlString: kmlString)
  }

  @MainActor
  private func addKmlLayerInternal(id: String, kmlString: String) {
    guard let data = kmlString.data(using: .utf8) else { return }
    let parser = GMUKMLParser(data: data)
    parser.parse()
    mapView.map { mapView in
      let renderer = GMUGeometryRenderer(
        map: mapView,
        geometries: parser.placemarks
      )
      renderer.render()
    }
  }

  @MainActor
  func removeKmlLayer(id: String) {
    kmlLayerById.removeValue(forKey: id).map { $0.clear() }
  }

  @MainActor
  func clearKmlLayers() {
    kmlLayerById.values.forEach { $0.clear() }
    kmlLayerById.removeAll()
    pendingKmlLayers.removeAll()
  }

  func deinitInternal() {
    markerBuilder.cancelAllIconTasks()
    clearMarkers()
    clearPolylines()
    clearPolygons()
    clearCircles()
    clearHeatmaps()
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
    mapView.selectedMarker = marker
    onMarkerPress?(marker.userData as? String, )
    return true
  }

  func mapView(_ mapView: GMSMapView, didTap overlay: GMSOverlay) {
    switch overlay {
    case let circle as GMSCircle:
      onCirclePress?(circle.userData as? String, )

    case let polygon as GMSPolygon:
      onPolygonPress?(polygon.userData as? String, )

    case let polyline as GMSPolyline:
      onPolylinePress?(polyline.userData as? String, )

    default:
      break
    }
  }

  func mapView(_ mapView: GMSMapView, didBeginDragging marker: GMSMarker) {
    onMarkerDragStart?(
      marker.userData as? String,
      RNLatLng(marker.position.latitude, marker.position.longitude)
    )
  }

  func mapView(_ mapView: GMSMapView, didDrag marker: GMSMarker) {
    onMarkerDrag?(
      marker.userData as? String,
      RNLatLng(marker.position.latitude, marker.position.longitude)
    )
  }

  func mapView(_ mapView: GMSMapView, didEndDragging marker: GMSMarker) {
    onMarkerDragEnd?(
      marker.userData as? String,
      RNLatLng(marker.position.latitude, marker.position.longitude)
    )
  }

  func didChangeActiveBuilding(_ building: GMSIndoorBuilding?) {
    guard let display = mapView?.indoorDisplay, let building else { return }
    onIndoorBuildingFocused?(building.toRNIndoorBuilding(from: display))
  }

  func didChangeActiveLevel(_ level: GMSIndoorLevel?) {
    guard
      let display = mapView?.indoorDisplay,
      let building = display.activeBuilding,
      let level,
      let index = building.levels.firstIndex(where: {
        $0.name == level.name && $0.shortName == level.shortName
      })
    else { return }

    onIndoorLevelActivated?(level.toRNIndoorLevel(index: index, active: true))
  }

}
