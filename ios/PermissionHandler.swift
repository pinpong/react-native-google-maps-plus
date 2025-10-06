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
    case .authorizedAlways, .authorizedWhenInUse:
      promise.resolve(
        withResult: RNLocationPermissionResult(
          android: nil,
          ios: RNIOSPermissionResult.authorized
        )
      )
      return promise
    case .denied, .restricted:
      promise.resolve(
        withResult: RNLocationPermissionResult(
          android: nil,
          ios: RNIOSPermissionResult.denied
        )
      )
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

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    guard !pendingPromises.isEmpty else { return }

    let status: RNIOSPermissionResult
    switch manager.authorizationStatus {
    case .authorizedWhenInUse, .authorizedAlways:
      status = RNIOSPermissionResult.authorized
    case .denied, .restricted:
      status = RNIOSPermissionResult.denied
    case .notDetermined:
      return
    @unknown default:
      status = RNIOSPermissionResult.denied
    }

    let promises = pendingPromises
    pendingPromises.removeAll()
    promises.forEach {
      $0.resolve(
        withResult: RNLocationPermissionResult(android: nil, ios: status)
      )
    }
  }
}
