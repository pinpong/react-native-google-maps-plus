import UIKit

extension Data {
  func toPng() -> Data? {
    UIImage(data: self)?.pngData()
  }
}
