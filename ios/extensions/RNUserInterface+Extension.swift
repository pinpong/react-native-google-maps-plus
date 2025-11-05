import UIKit

extension RNUserInterfaceStyle {
  var toUIUserInterfaceStyle: UIUserInterfaceStyle {
    switch self {
    case .light:
      return .light
    case .dark:
      return .dark
    case .system:
      return .unspecified
    @unknown default:
      return .unspecified
    }
  }
}
