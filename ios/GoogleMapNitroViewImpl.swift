import CoreLocation
import GoogleMaps
import UIKit

final class GoogleMapsNitroViewImpl: UIView, GMSMapViewDelegate {

  private let locationHandler: LocationHandler
  private let markerOptions: MapMarkerOptions
  private var mapView: GMSMapView!
  private var mapReady = false

  private var pendingBuildingEnabled: Bool = false
  private var pendingTrafficEnabled: Bool = false
  private var pendingCustomMapStyle: GMSMapStyle?
  private var pendingInitialCamera: GMSCameraPosition =
    GMSCameraPosition.camera(withLatitude: 0, longitude: 0, zoom: 0)
  private var pendingUserInterfaceStyle = UIUserInterfaceStyle.unspecified
  private var pendingMinZoomLevel: Double = 0.0
  private var pendingMaxZoomLevel: Double = 21.0
  private var pendingMapPadding: RNMapPadding = .init(
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  )

  private var pendingPolygons: [(id: String, polygon: GMSPolygon)] = []
  private var pendingPolylines: [(id: String, polyline: GMSPolyline)] = []
  private var pendingMarkers: [(id: String, marker: GMSMarker)] = []

  private var polygonsById: [String: GMSPolygon] = [:]
  private var polylinesById: [String: GMSPolyline] = [:]
  private var markersById: [String: GMSMarker] = [:]

  private var cameraMoveReasonIsGesture: Bool = false
  private var lastSubmittedCameraPosition: GMSCameraPosition?
  private var lastSubmittedLocation: CLLocation?

  var onMapError: ((RNMapErrorCode) -> Void)?
  var onMapReady: ((Bool) -> Void)?
  var onLocationUpdate: ((RNLocation) -> Void)?
  var onLocationError: ((_ error: RNLocationErrorCode) -> Void)?
  var onMapPress: ((RNLatLng) -> Void)?
  var onMarkerPress: ((String) -> Void)?
  var onCameraChangeStart: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChange: ((RNRegion, RNCamera, Bool) -> Void)?
  var onCameraChangeComplete: ((RNRegion, RNCamera, Bool) -> Void)?

  init(
    frame: CGRect = .zero,
    locationHandler: LocationHandler,
    markerOptions: MapMarkerOptions
  ) {
    self.locationHandler = locationHandler
    self.markerOptions = markerOptions
    super.init(frame: frame)
    setupAppLifecycleObservers()
    setupMap()

    /// wait 1 second if alle setter called
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
      self?.initLocationCallbacks()
      self?.applyPending()
      self?.onMapReady?(true)
      self?.mapReady = true
    }
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
  private func setupMap() {
    let options = GMSMapViewOptions()
    options.frame = bounds
    mapView = GMSMapView.init(options: options)
    mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    mapView.paddingAdjustmentBehavior = .never
    mapView.delegate = self
    addSubview(mapView)
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
    mapView.padding = UIEdgeInsets(
      top: pendingMapPadding.top,
      left: pendingMapPadding.left,
      bottom: pendingMapPadding.bottom,
      right: pendingMapPadding.right
    )

    mapView.mapStyle = pendingCustomMapStyle
    mapView.isBuildingsEnabled = pendingBuildingEnabled
    mapView.isTrafficEnabled = pendingTrafficEnabled
    mapView.overrideUserInterfaceStyle = pendingUserInterfaceStyle
    mapView.setMinZoom(
      Float(pendingMinZoomLevel),
      maxZoom: Float(pendingMaxZoomLevel)
    )

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
  }

  var currentCamera: GMSCameraPosition {
    mapView.camera
  }

  @MainActor
  var buildingEnabled: Bool {
    get { mapView.isBuildingsEnabled }
    set {
      pendingBuildingEnabled = newValue
      mapView.isBuildingsEnabled = newValue
    }
  }

  @MainActor
  var trafficEnabled: Bool {
    get { mapView.isTrafficEnabled }
    set {
      pendingTrafficEnabled = newValue
      mapView.isTrafficEnabled = newValue
    }
  }

  @MainActor
  var customMapStyle: GMSMapStyle? {
    get { pendingCustomMapStyle }
    set {
      pendingCustomMapStyle = newValue
      mapView.mapStyle = newValue
    }
  }

  @MainActor
  var initialCamera: GMSCameraPosition {
    get { pendingInitialCamera }
    set {
      pendingInitialCamera = newValue
      if mapView != nil && !mapReady {
        mapView.camera = newValue
      }
    }
  }

  @MainActor
  var userInterfaceStyle: UIUserInterfaceStyle {
    get { pendingUserInterfaceStyle }
    set {
      pendingUserInterfaceStyle = newValue
      mapView.overrideUserInterfaceStyle = newValue
    }
  }

  @MainActor
  var minZoomLevel: Double {
    get { pendingMinZoomLevel }
    set {
      pendingMinZoomLevel = newValue
      mapView.setMinZoom(Float(newValue), maxZoom: Float(pendingMaxZoomLevel))
    }
  }

  @MainActor
  var maxZoomLevel: Double {
    get { pendingMaxZoomLevel }
    set {
      pendingMaxZoomLevel = newValue
      mapView.setMinZoom(Float(pendingMinZoomLevel), maxZoom: Float(newValue))
    }
  }

  @MainActor
  var mapPadding: RNMapPadding {
    get { pendingMapPadding }
    set {
      pendingMapPadding = newValue
      mapView.padding = UIEdgeInsets(
        top: newValue.top,
        left: newValue.left,
        bottom: newValue.bottom,
        right: newValue.right
      )
    }
  }

  func setCamera(camera: RNCamera, animated: Bool, durationMS: Double) {
    let current = mapView.camera

    let zoom = Float(camera.zoom ?? Double(current.zoom))
    let bearing = camera.bearing ?? current.bearing
    let viewingAngle = camera.bearing ?? current.viewingAngle

    let target = CLLocationCoordinate2D(
      latitude: camera.center?.latitude ?? mapView.camera.target.latitude,
      longitude: camera.center?.longitude ?? mapView.camera.target.longitude
    )

    let cam = GMSCameraPosition.camera(
      withTarget: target,
      zoom: zoom,
      bearing: bearing,
      viewingAngle: viewingAngle
    )
    if animated {
      withCATransaction(
        disableActions: false,
        duration: durationMS / 1000.0
      ) {
        mapView.animate(to: cam)
      }
    } else {
      let update = GMSCameraUpdate.setCamera(cam)
      mapView.moveCamera(update)
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
        mapView.animate(with: update)
      }
    } else {
      mapView.moveCamera(update)
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

  func clearAll() {
    markerOptions.cancelAllIconTasks()
    clearMarkers()
    clearPolylines()
    clearPolygons()
    locationHandler.stop()
    clearMap()
  }

  @MainActor
  func clearMap() {
    mapView.clear()
    mapView.delegate = nil
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
    clearAll()
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
    ))
  }

  func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool {
    let id = (marker.userData as? String) ?? "unknown"
    onMarkerPress?(id)
    return true
  }
}
