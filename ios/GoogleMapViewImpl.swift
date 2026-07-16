import CoreLocation
import GoogleMaps
import NitroModules
import UIKit

final class GoogleMapsViewImpl: UIView, GMSMapViewDelegate,
GMSIndoorDisplayDelegate {

  private let mapErrorHandler: MapErrorHandler
  private let locationHandler: LocationHandler
  private let markerManager: MapMarkerManager
  private var mapView: GMSMapView?
  private var mapViewInitialized = false
  private var mapViewLoaded = false
  private var deInitialized = false

  private let polylineManager = MapPolylineManager(builder: MapPolylineBuilder())
  private let polygonManager = MapPolygonManager(builder: MapPolygonBuilder())
  private let circleManager = MapCircleManager(builder: MapCircleBuilder())
  private let heatmapManager = MapHeatmapManager(builder: MapHeatmapBuilder())
  private let urlTileOverlayManager = MapUrlTileOverlayManager(builder: MapUrlTileOverlayBuilder())
  private let kmlLayerManager: MapKmlLayerManager

  private var cameraMoveReasonIsGesture: Bool = false

  init(
    frame: CGRect = .zero,
    mapErrorHandler: MapErrorHandler,
    locationHandler: LocationHandler
  ) {
    self.mapErrorHandler = mapErrorHandler
    self.locationHandler = locationHandler
    self.markerManager = MapMarkerManager(
      builder: MapMarkerBuilder(mapErrorHandler: mapErrorHandler)
    )
    self.kmlLayerManager = MapKmlLayerManager(mapErrorHandler: mapErrorHandler)
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
    ({ self.transitEnabled = self.transitEnabled })()
    ({ self.customMapStyle = self.customMapStyle })()
    ({ self.mapType = self.mapType })()
    ({ self.userInterfaceStyle = self.userInterfaceStyle })()
    ({ self.mapZoomConfig = self.mapZoomConfig })()
    ({ self.locationConfig = self.locationConfig })()

    mapView.map { mapView in
      markerManager.attachMap(mapView)
      polylineManager.attachMap(mapView)
      polygonManager.attachMap(mapView)
      circleManager.attachMap(mapView)
      heatmapManager.attachMap(mapView)
      kmlLayerManager.attachMap(mapView)
      urlTileOverlayManager.attachMap(mapView)
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

        /* self.uiSettings?.mapToolbarEnabled → unsupported on iOS */
        /* self.uiSettings?.zoomControlsEnabled → unsupported on iOS */
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

  var transitEnabled: Bool? {
    didSet {
      onMain {
        self.mapView?.isTransitEnabled = self.transitEnabled ?? false
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
    markerManager.showInfoWindow(id: id)
  }

  func hideMarkerInfoWindow(id: String) {
    markerManager.hideInfoWindow(id: id)
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
        resultIsFile: resultIsFile,
        mapErrorHandler: self.mapErrorHandler
      ) {
        promise.resolve(withResult: result)
      } else {
        promise.resolve(withResult: nil)
      }
    }

    return promise
  }

  func addMarker(_ marker: RNMarker) {
    markerManager.add(marker)
  }

  func updateMarker(_ marker: RNMarker) {
    markerManager.update(marker)
  }

  func removeMarker(id: String) {
    markerManager.remove(id: id)
  }

  func addPolyline(_ polyline: RNPolyline) {
    polylineManager.add(polyline)
  }

  func updatePolyline(_ polyline: RNPolyline) {
    polylineManager.update(polyline)
  }

  func removePolyline(id: String) {
    polylineManager.remove(id: id)
  }

  func addPolygon(_ polygon: RNPolygon) {
    polygonManager.add(polygon)
  }

  func updatePolygon(_ polygon: RNPolygon) {
    polygonManager.update(polygon)
  }

  func removePolygon(id: String) {
    polygonManager.remove(id: id)
  }

  func addCircle(_ circle: RNCircle) {
    circleManager.add(circle)
  }

  func updateCircle(_ circle: RNCircle) {
    circleManager.update(circle)
  }

  func removeCircle(id: String) {
    circleManager.remove(id: id)
  }

  func addHeatmap(_ heatmap: RNHeatmap) {
    heatmapManager.add(heatmap)
  }

  func updateHeatmap(_ heatmap: RNHeatmap) {
    heatmapManager.update(heatmap)
  }

  func removeHeatmap(id: String) {
    heatmapManager.remove(id: id)
  }

  func addKmlLayer(_ kmlLayer: RNKMLayer) {
    kmlLayerManager.add(kmlLayer)
  }

  func updateKmlLayer(_ kmlLayer: RNKMLayer) {
    kmlLayerManager.update(kmlLayer)
  }

  func removeKmlLayer(id: String) {
    kmlLayerManager.remove(id: id)
  }

  func addUrlTileOverlay(_ urlTileOverlay: RNUrlTileOverlay) {
    urlTileOverlayManager.add(urlTileOverlay)
  }

  func updateUrlTileOverlay(_ urlTileOverlay: RNUrlTileOverlay) {
    urlTileOverlayManager.update(urlTileOverlay)
  }

  func removeUrlTileOverlay(id: String) {
    urlTileOverlayManager.remove(id: id)
  }

  func deinitInternal() {
    guard !deInitialized else { return }
    deInitialized = true
    detachLifecycleObservers()
    onMain {
      self.locationHandler.stop()
      self.markerManager.destroy()
      self.polylineManager.destroy()
      self.polygonManager.destroy()
      self.circleManager.destroy()
      self.heatmapManager.destroy()
      self.urlTileOverlayManager.destroy()
      self.kmlLayerManager.destroy()
      self.mapView?.clear()
      self.mapView?.isTrafficEnabled = false
      self.mapView?.isIndoorEnabled = false
      self.mapView?.isTransitEnabled = false
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
    markerManager.cancelAllRenders()
    markerManager.clearIconCache()
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
      if self.markerManager.consumeInfoWindowRefresh(marker.idTag) { return }
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
    return markerManager.infoWindowView(markerTag: marker.tagData)
  }

  func mapView(_ mapView: GMSMapView, markerInfoContents marker: GMSMarker) -> UIView? {
    return nil
  }
}
