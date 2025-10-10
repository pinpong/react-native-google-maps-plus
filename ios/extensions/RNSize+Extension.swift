import UIKit

extension RNSize {
  func toCGSize() -> CGSize? {
    CGSize(width: width, height: height)
  }
}
