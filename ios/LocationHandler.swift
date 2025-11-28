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

  private var currentDesiredAccuracy: CLLocationAccuracy =
    kCLLocationAccuracyDefault
  private var currentDistanceFilter: CLLocationDistance =
    kCLDistanceFilterNoneDefault
  private var currentActivityType: CLActivityType = kCLActivityTypeDefault

  var onUpdate: ((CLLocation) -> Void)?
  var onError: ((_ error: RNLocationErrorCode) -> Void)?

  override init() {
    super.init()
    manager.delegate = self
    manager.pausesLocationUpdatesAutomatically = true
  }

  func updateConfig(
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
        ) { _ in
          self.openLocationSettings()
        }
      )
      vc.present(alert, animated: true, completion: nil)
    }
  }

  func start() {
    guard !isActive else { return }
    isActive = true

    manager.requestLocation()
    manager.startUpdatingLocation()
  }

  func stop() {
    guard isActive else { return }
    isActive = false
    manager.stopUpdatingLocation()
  }

  func openLocationSettings() {
    onMain {
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

  func locationManager(
    _ manager: CLLocationManager,
    didFailWithError error: Error
  ) {
    let code: RNLocationErrorCode
    if let clError = error as? CLError {
      code = clError.code.toRNLocationErrorCode
    } else {
      code = .internalError
    }
    onError?(code)
  }

  func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let loc = locations.last else { return }
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
