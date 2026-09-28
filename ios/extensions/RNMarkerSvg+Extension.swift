import UIKit

extension RNMarkerSvg {
  func toPixelSize(scale: CGFloat) -> (width: Int, height: Int)? {
    let width = (width * scale).rounded(.up)
    let height = (height * scale).rounded(.up)
    guard width >= 1, height >= 1,
          let width = Int32(exactly: width),
          let height = Int32(exactly: height) else { return nil }
    return (Int(width), Int(height))
  }
}
