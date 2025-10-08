import UIKit

extension RNUserInterfaceStyle {
  var toUIUserInterfaceStyle: UIUserInterfaceStyle {
    switch self {
    case .light:
      return .light
    case .dark:
      return .dark
    case .default:
      return .unspecified
    @unknown default:
      return .unspecified
    }
  }
}
