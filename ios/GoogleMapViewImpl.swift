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
  private var loaded = false
  private var deInitialized = false

  private var pendingMarkers: [(id: String, marker: GMSMarker)] = []
  private var pendingPolylines: [(id: String, polyline: GMSPolyline)] = []
  private var pendingPolygons: [(id: String, polygon: GMSPolygon)] = []
  private var pendingCircles: [(id: String, circle: GMSCircle)] = []
  private var pendingHeatmaps: [(id: String, heatmap: GMUHeatmapTileLayer)] = []
  private var pendingKmlLayers: [(id: String, kmlString: String)] = []
  private var pendingUrlTileOverlays: [(id: String, urlTileOverlay: GMSURLTileLayer)] = []

  private var markersById: [String: GMSMarker] = [:]
  private var polylinesById: [String: GMSPolyline] = [:]
  private var polygonsById: [String: GMSPolygon] = [:]
  private var circlesById: [String: GMSCircle] = [:]
  private var heatmapsById: [String: GMUHeatmapTileLayer] = [:]
  private var kmlLayerById: [String: GMUGeometryRenderer] = [:]
  private var urlTileOverlays: [String: GMSURLTileLayer] = [:]

  private var cameraMoveReasonIsGesture: Bool = false

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

  @MainActor
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
  func initMapView(googleMapOptions: GMSMapViewOptions) {
    if initialized { return }
    initialized = true
    googleMapOptions.frame = bounds

    mapView = GMSMapView.init(options: googleMapOptions)
    mapView?.delegate = self
    mapView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    mapView?.paddingAdjustmentBehavior = .never
    mapView.map { addSubview($0) }
    applyProps()
    initLocationCallbacks()
    onMapReady?(true)
  }

  @MainActor
  private func initLocationCallbacks() {
    locationHandler.onUpdate = { [weak self] loc in
      guard let self = self else { return }
      self.onLocationUpdate?(loc.toRnLocation())
    }
    locationHandler.onError = { [weak self] error in
      self?.onLocationError?(error)
    }
    locationHandler.start()
  }

  @MainActor
  private func applyProps() {
    ({ self.uiSettings = self.uiSettings })()
    ({ self.mapPadding = self.mapPadding })()
    ({ self.myLocationEnabled = self.myLocationEnabled })()
    ({ self.buildingEnabled = self.buildingEnabled })()
    ({ self.trafficEnabled = self.trafficEnabled })()
    ({ self.indoorEnabled = self.indoorEnabled })()
    ({ self.customMapStyle = self.customMapStyle })()
    ({ self.mapType = self.mapType })()
    ({ self.userInterfaceStyle = self.userInterfaceStyle })()
    ({ self.mapZoomConfig = self.mapZoomConfig })()
    ({ self.locationConfig = self.locationConfig })()

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
    if !pendingUrlTileOverlays.isEmpty {
      pendingUrlTileOverlays.forEach {
        addUrlTileOverlayInternal(id: $0.id, urlTileOverlay: $0.urlTileOverlay)
      }
      pendingUrlTileOverlays.removeAll()
    }
  }

  @MainActor
  var currentCamera: GMSCameraPosition? {
    mapView?.camera
  }

  @MainActor
  var initialProps: RNInitialProps? {
    didSet {}
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
      mapView?.settings.zoomGestures = uiSettings?.zoomGesturesEnabled ?? true
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

  @MainActor
  var mapPadding: RNMapPadding? {
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

  @MainActor
  var mapType: GMSMapViewType? {
    didSet {
      mapView?.mapType = mapType ?? .normal
    }
  }

  @MainActor
  var locationConfig: RNLocationConfig? {
    didSet {
      locationHandler.desiredAccuracy =
        locationConfig?.ios?.desiredAccuracy?.toCLLocationAccuracy
      locationHandler.distanceFilterMeters =
        locationConfig?.ios?.distanceFilterMeters
    }
  }

  var onMapError: ((RNMapErrorCode) -> Void)?
  var onMapReady: ((Bool) -> Void)?
  var onMapLoaded: ((Bool) -> Void)?
  var onLocationUpdate: ((RNLocation) -> Void)?
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)?
  var onMapPress: ((RNLatLng) -> Void)?
  var onMapLongPress: ((RNLatLng) -> Void)?
  var onPoiPress: ((String, String, RNLatLng) -> Void)?
  var onMarkerPress: ((String?) -> Void)?
  var onPolylinePress: ((String?) -> Void)?
  var onPolygonPress: ((String?) -> Void)?
  var onCirclePress: ((String?) -> Void)?
  var onMarkerDragStart: ((String?, RNLatLng) -> Void)?
  var onMarkerDrag: ((String?, RNLatLng) -> Void)?
  var onMarkerDragEnd: ((String?, RNLatLng) -> Void)?
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Void)?
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Void)?
  var onInfoWindowPress: ((String?) -> Void)?
  var onInfoWindowClose: ((String?) -> Void)?
  var onInfoWindowLongPress: ((String?) -> Void)?
  var onMyLocationPress: ((RNLocation) -> Void)?
  var onMyLocationButtonPress: ((Bool) -> Void)?
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)?

  @MainActor
  func setCamera(camera: GMSCameraPosition, animated: Bool, durationMs: Double) {
    if animated {
      withCATransaction(
        disableActions: false,
        duration: durationMs / 1000.0
      ) {
        self.mapView?.animate(to: camera)
      }
    } else {
      let update = GMSCameraUpdate.setCamera(camera)
      mapView?.moveCamera(update)
    }
  }

  @MainActor
  func setCameraToCoordinates(
    coordinates: [RNLatLng],
    padding: RNMapPadding,
    animated: Bool,
    durationMs: Double
  ) {
    guard let firstCoordinates = coordinates.first else {
      return
    }
    var bounds = GMSCoordinateBounds(
      coordinate: firstCoordinates.toCLLocationCoordinate2D(),
      coordinate: firstCoordinates.toCLLocationCoordinate2D()
    )

    for coord in coordinates.dropFirst() {
      bounds = bounds.includingCoordinate(coord.toCLLocationCoordinate2D())
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
        duration: durationMs / 1000.0
      ) {
        self.mapView?.animate(with: update)
      }
    } else {
      mapView?.moveCamera(update)
    }
  }

  @MainActor
  func setCameraBounds(_ bounds: GMSCoordinateBounds?) {
    mapView?.cameraTargetBounds = bounds
  }

  @MainActor
  func animateToBounds(
    _ bounds: GMSCoordinateBounds,
    padding: Double,
    durationMs: Double,
    lockBounds: Bool
  ) {
    if lockBounds {
      mapView?.cameraTargetBounds = bounds
    }

    let update = GMSCameraUpdate.fit(bounds, withPadding: CGFloat(padding))
    mapView?.animate(with: update)
  }

  @MainActor
  func snapshot(
    size: CGSize?,
    format: String,
    imageFormat: ImageFormat,
    quality: CGFloat,
    resultIsFile: Bool
  ) -> NitroModules.Promise<String?> {
    let promise = Promise<String?>()

    onMainAsync {
      guard let mapView = self.mapView else {
        promise.resolve(withResult: nil)
        return
      }

      let renderer = UIGraphicsImageRenderer(bounds: mapView.bounds)
      let image = renderer.image { ctx in
        mapView.layer.render(in: ctx.cgContext)
      }

      var finalImage = image

      size.map {
        UIGraphicsBeginImageContextWithOptions($0, false, 0.0)
        image.draw(in: CGRect(origin: .zero, size: $0))
        finalImage = UIGraphicsGetImageFromCurrentImageContext() ?? image
        UIGraphicsEndImageContext()
      }

      let data: Data?
      switch imageFormat {
      case .jpeg:
        data = finalImage.jpegData(compressionQuality: quality)
      case .png:
        data = finalImage.pngData()
      }

      guard let imageData = data else {
        promise.resolve(withResult: nil)
        return
      }

      if resultIsFile {
        let filename =
          "map_snapshot_\(Int(Date().timeIntervalSince1970)).\(format)"
        let fileURL = URL(fileURLWithPath: NSTemporaryDirectory())
          .appendingPathComponent(filename)
        do {
          try imageData.write(to: fileURL)
          promise.resolve(withResult: fileURL.path)
        } catch {
          promise.resolve(withResult: nil)
        }
      } else {
        let base64 = imageData.base64EncodedString()
        promise.resolve(withResult: "data:image/\(format);base64,\(base64)")
      }
    }

    return promise
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
    heatmapsById.values.forEach {
      $0.clearTileCache()
      $0.map = nil
    }
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

  @MainActor
  func addUrlTileOverlay(id: String, urlTileOverlay: GMSURLTileLayer) {
    if mapView == nil {
      pendingUrlTileOverlays.append((id, urlTileOverlay))
      return
    }
    urlTileOverlays.removeValue(forKey: id).map { $0.map = nil }
    addUrlTileOverlayInternal(id: id, urlTileOverlay: urlTileOverlay)
  }

  @MainActor
  private func addUrlTileOverlayInternal(
    id: String,
    urlTileOverlay: GMSURLTileLayer
  ) {
    urlTileOverlay.map = mapView
  }

  @MainActor
  func removeUrlTileOverlay(id: String) {
    urlTileOverlays.removeValue(forKey: id).map { $0.map = nil }
  }

  @MainActor
  func clearUrlTileOverlay() {
    urlTileOverlays.values.forEach { $0.map = nil }
    urlTileOverlays.removeAll()
    pendingUrlTileOverlays.removeAll()
  }

  func deinitInternal() {
    guard !deInitialized else { return }
    deInitialized = true
    onMain {
      self.locationHandler.stop()
      self.markerBuilder.cancelAllIconTasks()
      self.clearMarkers()
      self.clearPolylines()
      self.clearPolygons()
      self.clearCircles()
      self.clearHeatmaps()
      self.clearKmlLayers()
      self.clearUrlTileOverlay()
      self.mapView?.clear()
      self.mapView?.indoorDisplay.delegate = nil
      self.mapView?.delegate = nil
      self.mapView = nil
      self.initialized = false
    }
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
      locationHandler.start()
    } else {
      locationHandler.stop()
    }
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    deinitInternal()
  }

  func mapViewDidFinishTileRendering(_ mapView: GMSMapView) {
    guard !loaded else { return }
    loaded = true
    onMapLoaded?(true)
  }

  func mapView(_ mapView: GMSMapView, willMove gesture: Bool) {
    onMain {
      self.cameraMoveReasonIsGesture = gesture

      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()

      self.onCameraChangeStart?(visibleRegion, camera, gesture)
    }
  }

  func mapView(_ mapView: GMSMapView, didChange position: GMSCameraPosition) {
    onMain {
      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()
      let gesture = self.cameraMoveReasonIsGesture

      self.onCameraChange?(visibleRegion, camera, gesture)
    }
  }

  func mapView(_ mapView: GMSMapView, idleAt position: GMSCameraPosition) {
    onMain {
      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()
      let gesture = self.cameraMoveReasonIsGesture

      self.onCameraChangeComplete?(visibleRegion, camera, gesture)
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didTapAt coordinate: CLLocationCoordinate2D
  ) {
    onMain {
      self.onMapPress?(
        coordinate.toRNLatLng(),
      )
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didLongPressAt coordinate: CLLocationCoordinate2D
  ) {
    onMain {
      self.onMapLongPress?(
        coordinate.toRNLatLng(),
      )
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didTapPOIWithPlaceID placeID: String,
    name: String,
    location: CLLocationCoordinate2D
  ) {
    onMain {
      self.onPoiPress?(placeID, name, location.toRNLatLng())
    }
  }

  func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool {
    onMain {
      mapView.selectedMarker = marker
      self.onMarkerPress?(marker.userData as? String, )
    }
    return false
  }

  func mapView(_ mapView: GMSMapView, didTap overlay: GMSOverlay) {
    onMain {
      switch overlay {
      case let circle as GMSCircle:
        self.onCirclePress?(circle.userData as? String, )

      case let polygon as GMSPolygon:
        self.onPolygonPress?(polygon.userData as? String, )

      case let polyline as GMSPolyline:
        self.onPolylinePress?(polyline.userData as? String, )

      default:
        break
      }
    }
  }

  func mapView(_ mapView: GMSMapView, didBeginDragging marker: GMSMarker) {
    onMain {
      self.onMarkerDragStart?(
        marker.userData as? String,
        marker.position.toRNLatLng()
      )
    }
  }

  func mapView(_ mapView: GMSMapView, didDrag marker: GMSMarker) {
    onMain {
      self.onMarkerDrag?(
        marker.userData as? String,
        marker.position.toRNLatLng()
      )
    }
  }

  func mapView(_ mapView: GMSMapView, didEndDragging marker: GMSMarker) {
    onMain {
      self.onMarkerDragEnd?(
        marker.userData as? String,
        marker.position.toRNLatLng()
      )
    }
  }

  func didChangeActiveBuilding(_ building: GMSIndoorBuilding?) {
    onMain {
      guard let display = self.mapView?.indoorDisplay, let building else {
        return
      }
      self.onIndoorBuildingFocused?(building.toRNIndoorBuilding(from: display))
    }
  }

  func didChangeActiveLevel(_ level: GMSIndoorLevel?) {
    onMain {
      guard
        let display = self.mapView?.indoorDisplay,
        let building = display.activeBuilding,
        let level,
        let index = building.levels.firstIndex(where: {
          $0.name == level.name && $0.shortName == level.shortName
        })
      else { return }

      self.onIndoorLevelActivated?(
        level.toRNIndoorLevel(index: index, active: true)
      )
    }
  }

  func mapView(_ mapView: GMSMapView, didTapInfoWindowOf marker: GMSMarker) {
    onMain {
      self.onInfoWindowPress?(marker.userData as? String)
    }
  }

  func mapView(_ mapView: GMSMapView, didCloseInfoWindowOf marker: GMSMarker) {
    onMain {
      self.onInfoWindowClose?(marker.userData as? String)
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didLongPressInfoWindowOf marker: GMSMarker
  ) {
    onMain {
      self.onInfoWindowLongPress?(marker.userData as? String)
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didTapMyLocation location: CLLocationCoordinate2D
  ) {
    onMain {
      self.mapView?.myLocation.map {
        self.onMyLocationPress?($0.toRnLocation())
      }
    }
  }

  func didTapMyLocationButton(for mapView: GMSMapView) -> Bool {
    onMain {
      self.onMyLocationButtonPress?(true)
    }
    return false
  }
}
