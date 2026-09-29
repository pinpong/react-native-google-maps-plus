import CoreLocation
import Foundation
import NitroModules
import UIKit

final class PermissionHandler: NSObject, CLLocationManagerDelegate {
  private let manager = CLLocationManager()
  private var pendingPromises:
    [NitroModules.Promise<RNLocationPermissionResult>] = []

  override init() {
    super.init()
    manager.delegate = self
  }

  func requestLocationPermission()
  -> NitroModules.Promise<RNLocationPermissionResult> {
    let promise = NitroModules.Promise<RNLocationPermissionResult>()

    let status = manager.authorizationStatus
    switch status {
    case .authorizedAlways, .authorizedWhenInUse, .denied, .restricted:
      promise.resolve(withResult: getLocationPermission())
      return promise
    case .notDetermined:
      break
    @unknown default:
      break
    }

    pendingPromises.append(promise)
    manager.requestWhenInUseAuthorization()

    return promise
  }

  func getLocationPermission() -> RNLocationPermissionResult {
    return manager.toRNLocationPermissionResult()
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    guard !pendingPromises.isEmpty else { return }
    guard manager.authorizationStatus != .notDetermined else { return }

    let result = getLocationPermission()
    let promises = pendingPromises
    pendingPromises.removeAll()
    promises.forEach {
      $0.resolve(withResult: result)
    }
  }
}
