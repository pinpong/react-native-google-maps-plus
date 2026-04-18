import CoreLocation
import GoogleMaps
import NitroModules
import UIKit

final class StreetViewPanoramaViewImpl: UIView, GMSPanoramaViewDelegate {
  
  private let mapErrorHandler: MapErrorHandler
  private let locationHandler: LocationHandler
  private var panoramaView: GMSPanoramaView?
  private var panoramaViewInitialized = false
  private var deInitialized = false
  
  init(
    frame: CGRect = .zero,
    mapErrorHandler: MapErrorHandler,
    locationHandler: LocationHandler
  ) {
    self.mapErrorHandler = mapErrorHandler
    self.locationHandler = locationHandler
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
  
  func initPanoramaView() {
    onMain {
      if self.panoramaViewInitialized { return }
      self.panoramaViewInitialized = true
      
      let props = self.streetViewInitialProps
      if let position = props?.position {
        let coordinate = position.toCLLocationCoordinate2D()
        let source = props?.source?.toGMSPanoramaSource ?? .default
        if let radius = props?.radius {
          self.panoramaView = GMSPanoramaView.panorama(withFrame: self.bounds, nearCoordinate: coordinate, radius: UInt(radius), source: source)
        } else {
          self.panoramaView = GMSPanoramaView.panorama(withFrame: self.bounds, nearCoordinate: coordinate, source: source)
        }
      } else {
        self.panoramaView = GMSPanoramaView(frame: self.bounds)
      }
      
      props?.panoramaId.map { self.panoramaView?.move(toPanoramaID: $0) }
      props?.camera.map { self.panoramaView?.camera = $0.toGMSPanoramaCamera() }
      
      self.panoramaView?.delegate = self
      self.panoramaView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      self.panoramaView.map { self.addSubview($0) }
      
      self.applyProps()
      self.initLocationCallbacks()
      self.onPanoramaReady?(true)
    }
  }
  
  private func initLocationCallbacks() {
    locationHandler.onUpdate = { [weak self] loc in
      onMain { [weak self] in
        self?.onLocationUpdate?(loc.toRnLocation())
      }
    }
    
    locationHandler.onError = { [weak self] error in
      onMain { [weak self] in
        self?.onLocationError?(error)
      }
    }
  }
  
  private func applyProps() {
    ({ self.uiSettings = self.uiSettings })()
  }
  
  var currentCamera: GMSPanoramaCamera? { panoramaView?.camera }
  
  var streetViewInitialProps: RNStreetViewInitialProps?
  
  var uiSettings: RNStreetViewUiSettings? {
    didSet {
      onMain {
        self.panoramaView?.streetNamesHidden = !(self.uiSettings?.streetNamesEnabled ?? true)
        self.panoramaView?.navigationLinksHidden = !(self.uiSettings?.userNavigationEnabled ?? true)
        self.panoramaView?.orientationGestures = self.uiSettings?.panningGesturesEnabled ?? true
        self.panoramaView?.zoomGestures = self.uiSettings?.zoomGesturesEnabled ?? true
      }
    }
  }
  
  var onPanoramaReady: ((Bool) -> Void)?
  var onLocationUpdate: ((RNLocation) -> Void)?
  var onLocationError: ((RNLocationErrorCode) -> Void)?
  var onPanoramaChange: ((RNStreetViewPanoramaLocation) -> Void)?
  var onCameraChange: ((RNStreetViewCamera) -> Void)?
  var onPanoramaPress: ((RNStreetViewOrientation) -> Void)?
  
  func setCamera(_ camera: GMSPanoramaCamera, animated: Bool, durationMs: Double) {
    onMain {
      if animated {
        withCATransaction(disableActions: false, duration: durationMs / 1000.0) {
          self.panoramaView?.camera = camera
        }
      } else {
        self.panoramaView?.camera = camera
      }
    }
  }
  
  func setPosition(_ coordinate: CLLocationCoordinate2D, radius: UInt?, source: GMSPanoramaSource) {
    onMain {
      if let radius {
        self.panoramaView?.moveNearCoordinate(coordinate, radius: radius, source: source)
      } else {
        self.panoramaView?.moveNearCoordinate(coordinate, source: source)
      }
    }
  }
  
  func setPositionById(_ panoramaId: String) {
    onMain {
      self.panoramaView?.move(toPanoramaID: panoramaId)
    }
  }
  
  func deinitInternal() {
    guard !deInitialized else { return }
    deInitialized = true
    detachLifecycleObservers()
    onMain {
      self.locationHandler.stop()
      self.panoramaView?.delegate = nil
      self.panoramaView = nil
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
  
  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      attachLifecycleObservers()
      locationHandler.start()
      initPanoramaView()
    } else {
      locationHandler.stop()
      detachLifecycleObservers()
    }
  }
  
  deinit {
    deinitInternal()
  }
  
  func panoramaView(_ panoramaView: GMSPanoramaView, didMoveTo panorama: GMSPanorama?) {
    onMain {
      guard let panorama else { return }
      let links = panorama.links.map { link in
        RNStreetViewPanoramaLink(bearing: link.heading, panoramaId: link.panoramaID)
      }
      self.onPanoramaChange?(
        RNStreetViewPanoramaLocation(
          position: panorama.coordinate.toRNLatLng(),
          panoramaId: panorama.panoramaID,
          links: links
        )
      )
    }
  }
  
  func panoramaView(_ panoramaView: GMSPanoramaView, error: Error, onMoveNearCoordinate coordinate: CLLocationCoordinate2D) {
    mapErrorHandler.report(.panoramaNotFound, error.localizedDescription, error)
  }
  
  func panoramaView(_ panoramaView: GMSPanoramaView, error: Error, onMoveToPanoramaID panoramaID: String) {
    mapErrorHandler.report(.panoramaNotFound, error.localizedDescription, error)
  }
  
  func panoramaView(_ panoramaView: GMSPanoramaView, didMove camera: GMSPanoramaCamera) {
    onMain {
      self.onCameraChange?(
        RNStreetViewCamera(
          bearing: camera.orientation.heading,
          tilt: camera.orientation.pitch,
          zoom: Double(camera.zoom)
        )
      )
    }
  }
  
  func panoramaView(_ panoramaView: GMSPanoramaView, didTap point: CGPoint) {
    onMain {
      let orientation = panoramaView.orientation(for: point)
      self.onPanoramaPress?(RNStreetViewOrientation(bearing: orientation.heading, tilt: orientation.pitch))
    }
  }
}
