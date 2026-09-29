import CoreLocation
import Foundation
import UIKit

private let kCLLocationAccuracyDefault: CLLocationAccuracy =
  kCLLocationAccuracyBest
private let kCLDistanceFilterNoneDefault: CLLocationDistance =
  kCLDistanceFilterNone
private let kCLActivityTypeDefault: CLActivityType = .other

final class LocationHandler: NSObject, CLLocationManagerDelegate {

  private let manager = CLLocationManager()

  private var isActive = false
  private var isStarted = false
  private var isEnabled = false
  private var lastReportedError: RNLocationErrorCode?

  private var currentDesiredAccuracy: CLLocationAccuracy =
    kCLLocationAccuracyDefault
  private var currentDistanceFilter: CLLocationDistance =
    kCLDistanceFilterNoneDefault
  private var currentActivityType: CLActivityType = kCLActivityTypeDefault

  var onUpdate: ((CLLocation) -> Void)?
  var onError: ((RNLocationErrorCode) -> Void)?
  var onStatusChange: ((RNLocationPermissionResult) -> Void)?

  override init() {
    super.init()
    manager.delegate = self
    manager.pausesLocationUpdatesAutomatically = true
  }

  func updateConfig(
    enabled: Bool?,
    desiredAccuracy: CLLocationAccuracy?,
    distanceFilterMeters: CLLocationDistance?,
    activityType: CLActivityType?
  ) {
    currentDesiredAccuracy = desiredAccuracy ?? kCLLocationAccuracyDefault
    manager.desiredAccuracy = currentDesiredAccuracy

    currentDistanceFilter = distanceFilterMeters ?? kCLDistanceFilterNoneDefault
    manager.distanceFilter = currentDistanceFilter

    currentActivityType = activityType ?? kCLActivityTypeDefault
    manager.activityType = currentActivityType

    isEnabled = enabled ?? false
    guard isStarted else { return }
    if isEnabled {
      startUpdates()
    } else {
      stopUpdates()
    }
  }

  func showLocationDialog() {
    onMain {
      guard let vc = Self.topMostViewController() else { return }
      let title =
        Bundle.main.object(forInfoDictionaryKey: "LocationNotAvailableTitle")
        as? String
      let message =
        Bundle.main.object(forInfoDictionaryKey: "LocationNotAvailableMessage")
        as? String
      let cancelButton =
        Bundle.main.object(forInfoDictionaryKey: "CancelButton") as? String
      let openLocationSettingsButton =
        Bundle.main.object(forInfoDictionaryKey: "OpenLocationAlertButton")
        as? String

      let alert = UIAlertController(
        title: title ?? "Location not available",
        message: message ?? "Please check your location settings.",
        preferredStyle: .alert
      )
      alert.addAction(
        UIAlertAction(title: cancelButton ?? "Cancel", style: .cancel)
      )
      alert.addAction(
        UIAlertAction(
          title: openLocationSettingsButton ?? "Open settings",
          style: .default
        ) { [weak self] _ in
          self?.openLocationSettings()
        }
      )
      vc.present(alert, animated: true, completion: nil)
    }
  }

  private func checkLocationSettings() {
    reportStatus()

    switch manager.authorizationStatus {
    case .denied:
      manager.stopUpdatingLocation()
      // .denied is also reported when Location Services are off system-wide.
      reportError(
        CLLocationManager.locationServicesEnabled()
          ? .permissionDenied : .settingsNotSatisfied
      )
    case .restricted, .notDetermined:
      manager.stopUpdatingLocation()
      reportError(.permissionDenied)
    default:
      lastReportedError = nil
      manager.requestLocation()
      manager.startUpdatingLocation()
    }
  }

  private func reportStatus() {
    onStatusChange?(manager.toRNLocationPermissionResult())
  }

  private func reportError(_ code: RNLocationErrorCode) {
    guard lastReportedError != code else { return }
    lastReportedError = code
    onError?(code)
  }

  func start() {
    isStarted = true
    startUpdates()
  }

  func stop() {
    isStarted = false
    stopUpdates()
  }

  private func startUpdates() {
    guard !isActive, isEnabled else { return }
    isActive = true
    lastReportedError = nil
    checkLocationSettings()
  }

  private func stopUpdates() {
    guard isActive else { return }
    isActive = false
    manager.stopUpdatingLocation()
  }

  func openLocationSettings() {
    onMain {
      guard let url = URL(string: UIApplication.openSettingsURLString) else {
        return
      }
      UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    guard isActive else { return }
    checkLocationSettings()
  }

  func locationManager(
    _ manager: CLLocationManager,
    didFailWithError error: Error
  ) {
    guard isActive else { return }
    guard let clError = error as? CLError else {
      reportError(.internalError)
      return
    }
    // .locationUnknown is transient, .denied comes with the authorization change.
    guard clError.code != .locationUnknown, clError.code != .denied else { return }
    reportError(clError.code.toRNLocationErrorCode)
  }

  func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let loc = locations.last else { return }
    lastReportedError = nil
    onUpdate?(loc)
  }

  private static func topMostViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .filter { $0.activationState == .foregroundActive }

    guard
      let window = scenes.flatMap({ $0.windows }).first(where: {
        $0.isKeyWindow
      }),
      var top = window.rootViewController
    else { return nil }

    while let presented = top.presentedViewController { top = presented }
    return top
  }

}
