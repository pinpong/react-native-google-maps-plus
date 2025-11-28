import CoreLocation
import GoogleMaps
import GoogleMapsUtils
import NitroModules
import UIKit

final class GoogleMapsViewImpl: UIView, GMSMapViewDelegate,
GMSIndoorDisplayDelegate {

  private let locationHandler: LocationHandler
  private let markerBuilder: MapMarkerBuilder
  private var mapView: GMSMapView?
  private var mapViewInitialized = false
  private var mapViewLoaded = false
  private var deInitialized = false

  private var pendingMarkers: [(id: String, marker: GMSMarker)] = []
  private var pendingPolylines: [(id: String, polyline: GMSPolyline)] = []
  private var pendingPolygons: [(id: String, polygon: GMSPolygon)] = []
  private var pendingCircles: [(id: String, circle: GMSCircle)] = []
  private var pendingHeatmaps: [(id: String, heatmap: GMUHeatmapTileLayer)] = []
  private var pendingKmlLayers: [(id: String, kmlString: String)] = []
  private var pendingUrlTileOverlays:
    [(id: String, urlTileOverlay: GMSURLTileLayer)] = []

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
  }

  private var lifecycleAttached = false

  private var lifecycleTasks = [Task<Void, Never>]()

  private func attachLifecycleObservers() {
    if lifecycleAttached { return }
    lifecycleAttached = true
    lifecycleTasks.append(
      Task { @MainActor in
        for await _ in NotificationCenter.default.notifications(
          named: UIApplication.didBecomeActiveNotification
        ) {
          appDidBecomeActive()
        }
      }
    )

    lifecycleTasks.append(
      Task { @MainActor in
        for await _ in NotificationCenter.default.notifications(
          named: UIApplication.didEnterBackgroundNotification
        ) {
          appDidEnterBackground()
        }
      }
    )

    lifecycleTasks.append(
      Task { @MainActor in
        for await _ in NotificationCenter.default.notifications(
          named: UIApplication.didReceiveMemoryWarningNotification
        ) {
          onLowMemory()
        }
      }
    )
  }

  private func detachLifecycleObservers() {
    if !lifecycleAttached { return }
    lifecycleAttached = false
    lifecycleTasks.forEach { $0.cancel() }
    lifecycleTasks.removeAll()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  func initMapView() {
    onMain {
      if self.mapViewInitialized { return }
      self.mapViewInitialized = true
      self.googleMapOptions.frame = self.bounds

      self.mapView = GMSMapView.init(options: self.googleMapOptions)
      self.mapView?.delegate = self
      self.mapView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      self.mapView?.paddingAdjustmentBehavior = .never
      self.mapView.map { self.addSubview($0) }
      self.applyProps()
      self.initLocationCallbacks()
      self.onMapReady?(true)
    }
  }

  private func initLocationCallbacks() {
    locationHandler.onUpdate = { [weak self] loc in
      onMain { [weak self] in
        guard let self = self else { return }
        self.onLocationUpdate?(loc.toRnLocation())
      }
    }

    locationHandler.onError = { [weak self] error in
      onMain { [weak self] in
        guard let self = self else { return }
        self.onLocationError?(error)
      }
    }
  }

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

  var currentCamera: GMSCameraPosition? {
    return mapView?.camera
  }

  var googleMapOptions: GMSMapViewOptions = GMSMapViewOptions()

  var uiSettings: RNMapUiSettings? {
    didSet {
      onMain {
        self.mapView?.settings.setAllGesturesEnabled(
          self.uiSettings?.allGesturesEnabled ?? true
        )
        self.mapView?.settings.compassButton =
          self.uiSettings?.compassEnabled ?? false
        self.mapView?.settings.indoorPicker =
          self.uiSettings?.indoorLevelPickerEnabled ?? false
        self.mapView?.settings.myLocationButton =
          self.uiSettings?.myLocationButtonEnabled ?? false
        self.mapView?.settings.rotateGestures =
          self.uiSettings?.rotateEnabled ?? true
        self.mapView?.settings.scrollGestures =
          self.uiSettings?.scrollEnabled ?? true
        self.mapView?.settings.allowScrollGesturesDuringRotateOrZoom =
          self.uiSettings?.scrollDuringRotateOrZoomEnabled ?? true
        self.mapView?.settings.tiltGestures =
          self.uiSettings?.tiltEnabled ?? true
        self.mapView?.settings.zoomGestures =
          self.uiSettings?.zoomGesturesEnabled ?? true
      }
    }
  }

  var myLocationEnabled: Bool? {
    didSet {
      onMain {
        self.mapView?.isMyLocationEnabled = self.myLocationEnabled ?? false
      }
    }
  }

  var buildingEnabled: Bool? {
    didSet {
      onMain {
        self.mapView?.isBuildingsEnabled = self.buildingEnabled ?? false
      }
    }
  }

  var trafficEnabled: Bool? {
    didSet {
      onMain {
        self.mapView?.isTrafficEnabled = self.trafficEnabled ?? false
      }
    }
  }

  var indoorEnabled: Bool? {
    didSet {
      onMain {
        self.mapView?.isIndoorEnabled = self.indoorEnabled ?? false
        self.mapView?.indoorDisplay.delegate =
          self.indoorEnabled == true ? self : nil
      }
    }
  }

  var customMapStyle: GMSMapStyle? {
    didSet {
      onMain {
        self.mapView?.mapStyle = self.customMapStyle
      }
    }
  }

  var userInterfaceStyle: UIUserInterfaceStyle? {
    didSet {
      onMain {
        self.mapView?.overrideUserInterfaceStyle =
          self.userInterfaceStyle ?? .unspecified
      }
    }
  }

  var mapZoomConfig: RNMapZoomConfig? {
    didSet {
      onMain {
        self.mapView?.setMinZoom(
          Float(self.mapZoomConfig?.min ?? 2),
          maxZoom: Float(self.mapZoomConfig?.max ?? 21)
        )
      }
    }
  }

  var mapPadding: RNMapPadding? {
    didSet {
      onMain {
        self.mapView?.padding =
          self.mapPadding.map {
            UIEdgeInsets(
              top: $0.top,
              left: $0.left,
              bottom: $0.bottom,
              right: $0.right
            )
          } ?? .zero
      }
    }
  }

  var mapType: GMSMapViewType? {
    didSet {
      onMain {
        self.mapView?.mapType = self.mapType ?? .normal
      }
    }
  }

  var locationConfig: RNLocationConfig? {
    didSet {
      locationHandler.updateConfig(
        desiredAccuracy: locationConfig?.ios?.desiredAccuracy?
          .toCLLocationAccuracy,
        distanceFilterMeters: locationConfig?.ios?.distanceFilterMeters,
        activityType: locationConfig?.ios?.activityType?.toCLActivityType,
      )
    }
  }

  var onMapError: ((RNMapErrorCode) -> Void)?
  var onMapReady: ((Bool) -> Void)?
  var onMapLoaded: ((RNRegion, RNCamera) -> Void)?
  var onLocationUpdate: ((RNLocation) -> Void)?
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)?
  var onMapPress: ((RNLatLng) -> Void)?
  var onMapLongPress: ((RNLatLng) -> Void)?
  var onPoiPress: ((String, String, RNLatLng) -> Void)?
  var onMarkerPress: ((String) -> Void)?
  var onPolylinePress: ((String) -> Void)?
  var onPolygonPress: ((String) -> Void)?
  var onCirclePress: ((String) -> Void)?
  var onMarkerDragStart: ((String, RNLatLng) -> Void)?
  var onMarkerDrag: ((String, RNLatLng) -> Void)?
  var onMarkerDragEnd: ((String, RNLatLng) -> Void)?
  var onIndoorBuildingFocused: ((RNIndoorBuilding) -> Void)?
  var onIndoorLevelActivated: ((RNIndoorLevel) -> Void)?
  var onInfoWindowPress: ((String) -> Void)?
  var onInfoWindowClose: ((String) -> Void)?
  var onInfoWindowLongPress: ((String) -> Void)?
  var onMyLocationPress: ((RNLocation) -> Void)?
  var onMyLocationButtonPress: ((Bool) -> Void)?
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)?

  func showMarkerInfoWindow(id: String) {
    onMain {
      guard let marker = self.markersById[id] else { return }
      self.mapView?.selectedMarker = nil
      self.mapView?.selectedMarker = marker
    }
  }

  func hideMarkerInfoWindow(id: String) {
    onMain {
      guard let marker = self.markersById[id] else { return }
      if self.mapView?.selectedMarker == marker {
        self.mapView?.selectedMarker = nil
      }
    }
  }

  func setCamera(camera: GMSCameraPosition, animated: Bool, durationMs: Double) {
    onMain {
      if animated {
        withCATransaction(
          disableActions: false,
          duration: durationMs / 1000.0
        ) {
          self.mapView?.animate(to: camera)
        }
      } else {
        let update = GMSCameraUpdate.setCamera(camera)
        self.mapView?.moveCamera(update)
      }
    }
  }

  func setCameraToCoordinates(
    coordinates: [RNLatLng],
    padding: RNMapPadding,
    animated: Bool,
    durationMs: Double
  ) {
    onMain {
      guard let firstCoordinates = coordinates.first else {
        return
      }
      var bounds = GMSCoordinateBounds(
        coordinate: firstCoordinates.toCLLocationCoordinate2D(),
        coordinate: firstCoordinates.toCLLocationCoordinate2D()
      )

      for coordinate in coordinates.dropFirst() {
        bounds = bounds.includingCoordinate(
          coordinate.toCLLocationCoordinate2D()
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
          duration: durationMs / 1000.0
        ) {
          self.mapView?.animate(with: update)
        }
      } else {
        self.mapView?.moveCamera(update)
      }
    }
  }

  func setCameraBounds(_ bounds: GMSCoordinateBounds?) {
    onMain {
      self.mapView?.cameraTargetBounds = bounds
    }
  }

  func animateToBounds(
    _ bounds: GMSCoordinateBounds,
    padding: Double,
    durationMs: Double,
    lockBounds: Bool
  ) {
    onMain {
      if lockBounds {
        self.mapView?.cameraTargetBounds = bounds
      }

      let update = GMSCameraUpdate.fit(bounds, withPadding: CGFloat(padding))
      self.mapView?.animate(with: update)
    }
  }

  func snapshot(
    size: CGSize?,
    format: String,
    imageFormat: ImageFormat,
    quality: CGFloat,
    resultIsFile: Bool
  ) -> NitroModules.Promise<String?> {
    let promise = Promise<String?>()

    onMain {
      guard let mapView = self.mapView else {
        promise.resolve(withResult: nil)
        return
      }

      let renderer = UIGraphicsImageRenderer(bounds: mapView.bounds)
      let image = renderer.image { ctx in
        mapView.layer.render(in: ctx.cgContext)
      }

      if let result = image.encode(
        targetSize: size,
        format: format,
        imageFormat: imageFormat,
        quality: quality,
        resultIsFile: resultIsFile
      ) {
        promise.resolve(withResult: result)
      } else {
        promise.resolve(withResult: nil)
      }
    }

    return promise
  }

  func addMarker(id: String, marker: GMSMarker) {
    onMain {
      if self.mapView == nil {
        self.pendingMarkers.append((id, marker))
        return
      }
      self.markersById.removeValue(forKey: id).map { $0.map = nil }
      self.addMarkerInternal(id: id, marker: marker)
    }
  }

  private func addMarkerInternal(id: String, marker: GMSMarker) {
    onMain {
      marker.map = self.mapView
      self.markersById[id] = marker
    }
  }

  func updateMarker(id: String, block: @escaping (GMSMarker) -> Void) {
    onMain {
      self.markersById[id].map {
        block($0)
        if let mapView = self.mapView, mapView.selectedMarker == $0 {
          mapView.selectedMarker = nil
          mapView.selectedMarker = $0
        }
      }
    }
  }

  func removeMarker(id: String) {
    onMain {
      self.markersById.removeValue(forKey: id).map {
        $0.icon = nil
        $0.map = nil
      }
    }
  }

  func clearMarkers() {
    onMain {
      self.markersById.values.forEach { $0.map = nil }
      self.markersById.removeAll()
      self.pendingMarkers.removeAll()
    }
  }

  func addPolyline(id: String, polyline: GMSPolyline) {
    onMain {
      if self.mapView == nil {
        self.pendingPolylines.append((id, polyline))
        return
      }
      self.polylinesById.removeValue(forKey: id).map { $0.map = nil }
      self.addPolylineInternal(id: id, polyline: polyline)
    }
  }

  private func addPolylineInternal(id: String, polyline: GMSPolyline) {
    onMain {
      polyline.tagData = PolylineTag(id: id)
      polyline.map = self.mapView
      self.polylinesById[id] = polyline
    }
  }

  func updatePolyline(id: String, block: @escaping (GMSPolyline) -> Void) {
    onMain {
      self.polylinesById[id].map { block($0) }
    }
  }

  func removePolyline(id: String) {
    onMain {
      self.polylinesById.removeValue(forKey: id).map { $0.map = nil }
    }
  }

  func clearPolylines() {
    onMain {
      self.polylinesById.values.forEach { $0.map = nil }
      self.polylinesById.removeAll()
      self.pendingPolylines.removeAll()
    }
  }

  func addPolygon(id: String, polygon: GMSPolygon) {
    onMain {
      if self.mapView == nil {
        self.pendingPolygons.append((id, polygon))
        return
      }
      self.polygonsById.removeValue(forKey: id).map { $0.map = nil }
      self.addPolygonInternal(id: id, polygon: polygon)
    }
  }

  private func addPolygonInternal(id: String, polygon: GMSPolygon) {
    onMain {
      polygon.tagData = PolygonTag(id: id)
      polygon.map = self.mapView
      self.polygonsById[id] = polygon
    }
  }

  func updatePolygon(id: String, block: @escaping (GMSPolygon) -> Void) {
    onMain {
      self.polygonsById[id].map { block($0) }
    }
  }

  func removePolygon(id: String) {
    onMain {
      self.polygonsById.removeValue(forKey: id).map { $0.map = nil }
    }
  }

  func clearPolygons() {
    onMain {
      self.polygonsById.values.forEach { $0.map = nil }
      self.polygonsById.removeAll()
      self.pendingPolygons.removeAll()
    }
  }

  func addCircle(id: String, circle: GMSCircle) {
    onMain {
      if self.mapView == nil {
        self.pendingCircles.append((id, circle))
        return
      }
      self.circlesById.removeValue(forKey: id).map { $0.map = nil }
      self.addCircleInternal(id: id, circle: circle)
    }
  }

  private func addCircleInternal(id: String, circle: GMSCircle) {
    onMain {
      circle.tagData = CircleTag(id: id)
      circle.map = self.mapView
      self.circlesById[id] = circle
    }
  }

  func updateCircle(id: String, block: @escaping (GMSCircle) -> Void) {
    onMain {
      self.circlesById[id].map { block($0) }
    }
  }

  func removeCircle(id: String) {
    onMain {
      self.circlesById.removeValue(forKey: id).map { $0.map = nil }
    }
  }

  func clearCircles() {
    onMain {
      self.circlesById.values.forEach { $0.map = nil }
      self.circlesById.removeAll()
      self.pendingCircles.removeAll()
    }
  }

  func addHeatmap(id: String, heatmap: GMUHeatmapTileLayer) {
    onMain {
      if self.mapView == nil {
        self.pendingHeatmaps.append((id, heatmap))
        return
      }
      self.heatmapsById.removeValue(forKey: id).map { $0.map = nil }
      self.addHeatmapInternal(id: id, heatmap: heatmap)
    }
  }

  private func addHeatmapInternal(id: String, heatmap: GMUHeatmapTileLayer) {
    onMain {
      heatmap.map = self.mapView
      self.heatmapsById[id] = heatmap
    }
  }

  func removeHeatmap(id: String) {
    onMain {
      self.heatmapsById.removeValue(forKey: id).map {
        $0.clearTileCache()
        $0.map = nil
      }
    }
  }

  func clearHeatmaps() {
    onMain {
      self.heatmapsById.values.forEach {
        $0.clearTileCache()
        $0.map = nil
      }
      self.heatmapsById.removeAll()
      self.pendingHeatmaps.removeAll()
    }
  }

  func addKmlLayer(id: String, kmlString: String) {
    onMain {
      if self.mapView == nil {
        self.pendingKmlLayers.append((id, kmlString))
        return
      }
      self.kmlLayerById.removeValue(forKey: id).map { $0.clear() }
      self.addKmlLayerInternal(id: id, kmlString: kmlString)
    }
  }

  private func addKmlLayerInternal(id: String, kmlString: String) {
    onMain {
      guard let data = kmlString.data(using: .utf8) else { return }
      let parser = GMUKMLParser(data: data)
      parser.parse()

      self.mapView.map { mapView in
        let renderer = GMUGeometryRenderer(
          map: mapView,
          geometries: parser.placemarks
        )
        renderer.render()
        self.kmlLayerById[id] = renderer
      }
    }
  }

  func removeKmlLayer(id: String) {
    onMain {
      self.kmlLayerById.removeValue(forKey: id).map { $0.clear() }
    }
  }

  func clearKmlLayers() {
    onMain {
      self.kmlLayerById.values.forEach { $0.clear() }
      self.kmlLayerById.removeAll()
      self.pendingKmlLayers.removeAll()
    }
  }

  func addUrlTileOverlay(id: String, urlTileOverlay: GMSURLTileLayer) {
    onMain {
      if self.mapView == nil {
        self.pendingUrlTileOverlays.append((id, urlTileOverlay))
        return
      }
      self.urlTileOverlays.removeValue(forKey: id).map { $0.map = nil }
      self.addUrlTileOverlayInternal(id: id, urlTileOverlay: urlTileOverlay)
    }
  }

  private func addUrlTileOverlayInternal(
    id: String,
    urlTileOverlay: GMSURLTileLayer
  ) {
    onMain {
      urlTileOverlay.map = self.mapView
      self.urlTileOverlays[id] = urlTileOverlay
    }
  }

  func removeUrlTileOverlay(id: String) {
    onMain {
      self.urlTileOverlays.removeValue(forKey: id).map {
        $0.clearTileCache()
        $0.map = nil
      }
    }
  }

  func clearUrlTileOverlay() {
    onMain {
      self.urlTileOverlays.values.forEach {
        $0.clearTileCache()
        $0.map = nil
      }
      self.urlTileOverlays.removeAll()
      self.pendingUrlTileOverlays.removeAll()
    }
  }

  func deinitInternal() {
    guard !deInitialized else { return }
    deInitialized = true
    detachLifecycleObservers()
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
      self.mapView?.isTrafficEnabled = false
      self.mapView?.isIndoorEnabled = false
      self.mapView?.isMyLocationEnabled = false
      self.mapView?.cameraTargetBounds = nil
      self.mapView?.layer.removeAllAnimations()
      self.mapView?.indoorDisplay.delegate = nil
      self.mapView?.delegate = nil
      self.mapView = nil
    }
  }

  private func appDidBecomeActive() {
    if window != nil {
      locationHandler.start()
    }
  }

  private func appDidEnterBackground() {
    locationHandler.stop()
  }

  private func onLowMemory() {
    markerBuilder.cancelAllIconTasks()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      attachLifecycleObservers()
      locationHandler.start()
      initMapView()
    } else {
      locationHandler.stop()
      detachLifecycleObservers()
    }
  }

  deinit {
    deinitInternal()
  }

  func mapViewDidFinishTileRendering(_ mapView: GMSMapView) {
    guard !mapViewLoaded else { return }
    onMain {
      self.mapViewLoaded = true

      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()

      self.onMapLoaded?(visibleRegion, camera)
    }
  }

  func mapView(_ mapView: GMSMapView, willMove gesture: Bool) {
    if !mapViewLoaded { return }
    onMain {
      self.cameraMoveReasonIsGesture = gesture

      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()

      self.onCameraChangeStart?(visibleRegion, camera, gesture)
    }
  }

  func mapView(_ mapView: GMSMapView, didChange position: GMSCameraPosition) {
    if !mapViewLoaded { return }
    onMain {
      let visibleRegion = mapView.projection.visibleRegion().toRNRegion()
      let camera = mapView.camera.toRNCamera()
      let gesture = self.cameraMoveReasonIsGesture

      self.onCameraChange?(visibleRegion, camera, gesture)
    }
  }

  func mapView(_ mapView: GMSMapView, idleAt position: GMSCameraPosition) {
    if !mapViewLoaded { return }
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
      self.onMarkerPress?(marker.idTag)
    }
    return uiSettings?.consumeOnMarkerPress ?? false
  }

  func mapView(_ mapView: GMSMapView, didTap overlay: GMSOverlay) {
    onMain {
      switch overlay {
      case let circle as GMSCircle:
        self.onCirclePress?(circle.idTag)

      case let polygon as GMSPolygon:
        self.onPolygonPress?(polygon.idTag)

      case let polyline as GMSPolyline:
        self.onPolylinePress?(polyline.idTag)

      default:
        break
      }
    }
  }

  func mapView(_ mapView: GMSMapView, didBeginDragging marker: GMSMarker) {
    onMain {
      self.onMarkerDragStart?(
        marker.idTag,
        marker.position.toRNLatLng()
      )
    }
  }

  func mapView(_ mapView: GMSMapView, didDrag marker: GMSMarker) {
    onMain {
      self.onMarkerDrag?(
        marker.idTag,
        marker.position.toRNLatLng()
      )
    }
  }

  func mapView(_ mapView: GMSMapView, didEndDragging marker: GMSMarker) {
    onMain {
      self.onMarkerDragEnd?(
        marker.idTag,
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
      self.onInfoWindowPress?(marker.idTag)
    }
  }

  func mapView(_ mapView: GMSMapView, didCloseInfoWindowOf marker: GMSMarker) {
    onMain {
      self.onInfoWindowClose?(marker.idTag)
    }
  }

  func mapView(
    _ mapView: GMSMapView,
    didLongPressInfoWindowOf marker: GMSMarker
  ) {
    onMain {
      self.onInfoWindowLongPress?(marker.idTag)
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
    return uiSettings?.consumeOnMyLocationButtonPress ?? false
  }

  func mapView(_ mapView: GMSMapView, markerInfoWindow marker: GMSMarker) -> UIView? {
    return markerBuilder.buildInfoWindow(markerTag: marker.tagData)
  }

  func mapView(_ mapView: GMSMapView, markerInfoContents marker: GMSMarker) -> UIView? {
    return nil
  }
}
