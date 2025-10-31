import CoreLocation
import Foundation
import UIKit

private let kCLLocationAccuracyDefault: CLLocationAccuracy =
  kCLLocationAccuracyBest
private let kCLDistanceFilterNoneDefault: CLLocationDistance =
  kCLDistanceFilterNone

final class LocationHandler: NSObject, CLLocationManagerDelegate {

  private let manager = CLLocationManager()

  var desiredAccuracy: CLLocationAccuracy? = kCLLocationAccuracyDefault {
    didSet {
      manager.desiredAccuracy = desiredAccuracy ?? kCLLocationAccuracyBest
    }
  }

  var distanceFilterMeters: CLLocationDistance? = kCLDistanceFilterNoneDefault {
    didSet {
      manager.distanceFilter = distanceFilterMeters ?? kCLDistanceFilterNone
    }
  }

  var onUpdate: ((CLLocation) -> Void)?
  var onError: ((_ error: RNLocationErrorCode) -> Void)?

  override init() {
    super.init()
    manager.delegate = self
    manager.pausesLocationUpdatesAutomatically = true
    manager.activityType = .other
  }

  func showLocationDialog() {
    onMainAsync { [weak self] in
      guard let self = self else { return }

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
    onMainAsync {
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

  private func startUpdates() {
    manager.desiredAccuracy = desiredAccuracy ?? kCLLocationAccuracyDefault
    manager.distanceFilter =
      distanceFilterMeters ?? kCLDistanceFilterNoneDefault
    manager.startUpdatingLocation()
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
