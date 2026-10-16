import UIKit

import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if let MAPS_API_KEY = Bundle.main.object(forInfoDictionaryKey: "MAPS_API_KEY") as? String {
        GMSServices.provideAPIKey(MAPS_API_KEY)
    }
    return true
  }
}
