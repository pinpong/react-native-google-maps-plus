import CoreLocation
import Foundation
import UIKit

final class LocationHandler: NSObject, CLLocationManagerDelegate {

  private let manager = CLLocationManager()
  private var priority: Int = Priority.highAccuracy.rawValue
  private var interval: TimeInterval = 5.0
  private var minUpdateInterval: TimeInterval = 5.0
  private var distanceFilterMeters: CLLocationDistance = kCLDistanceFilterNone

  var onUpdate: ((CLLocation) -> Void)?
  var onError: ((_ error: RNLocationErrorCode) -> Void)?

  private var lastEmit: Date?

  override init() {
    super.init()
    manager.delegate = self
    manager.pausesLocationUpdatesAutomatically = true
    manager.activityType = .other
    applyPriority()
  }

  func setPriority(_ priority: Int) {
    self.priority = priority
    applyPriority()
  }

  func setInterval(_ seconds: Int) {
    self.interval = max(0, TimeInterval(seconds))
  }

  func setFastestInterval(_ seconds: Int) {
    self.minUpdateInterval = max(0, TimeInterval(seconds))
  }

  func setDistanceFilter(_ meters: Double) {
    self.distanceFilterMeters = meters >= 0 ? meters : kCLDistanceFilterNone
    manager.distanceFilter = distanceFilterMeters
  }

  func showLocationDialog() {
    DispatchQueue.main.async {
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
        ) { _ in
          self.openLocationSettings()
        }
      )
      vc.present(alert, animated: true, completion: nil)
    }
  }

  func start() {
    stop()
    startUpdates()
  }

  func stop() {
    manager.stopUpdatingLocation()
  }

  func openLocationSettings() {
    DispatchQueue.main.async {
      let openSettings = {
        if #available(iOS 18.3, *) {
          guard
            let url = URL(
              string: UIApplication.openDefaultApplicationsSettingsURLString
            )
          else {
            return
          }
          UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
          guard let url = URL(string: UIApplication.openSettingsURLString)
          else {
            return
          }
          UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
      }

      openSettings()
    }
  }

  private func applyPriority() {
    guard let p = Priority(rawValue: priority) else {
      manager.desiredAccuracy = kCLLocationAccuracyBest
      return
    }
    switch p {
    case .highAccuracy:
      manager.desiredAccuracy = kCLLocationAccuracyBest
    case .balanced:
      manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
    case .lowPower:
      manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    case .passive:
      manager.desiredAccuracy = kCLLocationAccuracyKilometer
    }
  }

  private func startUpdates() {
    manager.distanceFilter = distanceFilterMeters
    manager.startUpdatingLocation()
  }

  private func shouldEmit(now: Date) -> Bool {
    if let last = lastEmit {
      let delta = now.timeIntervalSince(last)
      if delta < minUpdateInterval { return false }
    }
    return true
  }

  func locationManager(
    _ manager: CLLocationManager,
    didFailWithError error: Error
  ) {
    let code: RNLocationErrorCode

    if let clError = error as? CLError {
      switch clError.code {
      case .denied:
        code = RNLocationErrorCode.permissionDenied
      case .locationUnknown, .network:
        code = RNLocationErrorCode.positionUnavailable
      default:
        code = RNLocationErrorCode.internalError
      }
    } else {
      code = RNLocationErrorCode.internalError
    }
    onError?(code)
  }

  func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let loc = locations.last else { return }
    let now = Date()

    if shouldEmit(now: now) {
      lastEmit = now
      onUpdate?(loc)
    }
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

extension LocationHandler {
  enum Priority: Int {
    case highAccuracy = 100
    /// Android: PRIORITY_BALANCED_POWER_ACCURACY
    case balanced = 102
    /// Android: PRIORITY_LOW_POWER
    case lowPower = 104
    /// Android: PRIORITY_PASSIVE
    case passive = 105
  }
}
