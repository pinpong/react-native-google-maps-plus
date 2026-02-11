import Foundation

private let mapsLogTag = "react-native-google-maps-plus"

final class MapErrorHandler {

  var callback: ((RNMapErrorCode, String) -> Void)?

  func report(_ code: RNMapErrorCode, _ msg: String, _ error: Error? = nil) {
    if let error {
      NSLog("[%@] %@ | %@", mapsLogTag, msg, String(describing: error))
    } else {
      NSLog("[%@] %@", mapsLogTag, msg)
    }

    onMain { [weak self] in
      guard let self else { return }
      self.callback?(code, msg)
    }
  }
}
