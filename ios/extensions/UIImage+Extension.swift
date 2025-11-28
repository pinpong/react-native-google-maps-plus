import UIKit

extension UIImage {
  func encode(
    targetSize: CGSize? = nil,
    format: String = "png",
    imageFormat: ImageFormat = .png,
    quality: CGFloat = 1.0,
    resultIsFile: Bool = false
  ) -> String? {
    var imageToEncode = self

    if let targetSize = targetSize {
      UIGraphicsBeginImageContextWithOptions(targetSize, false, 0.0)
      self.draw(in: CGRect(origin: .zero, size: targetSize))
      imageToEncode = UIGraphicsGetImageFromCurrentImageContext() ?? self
      UIGraphicsEndImageContext()
    }

    let data: Data?
    switch imageFormat {
    case .jpeg:
      data = imageToEncode.jpegData(compressionQuality: quality)
    case .png:
      data = imageToEncode.pngData()
    }

    guard let imageData = data else { return nil }

    if resultIsFile {
      let filename = "snapshot_\(Int(Date().timeIntervalSince1970)).\(format)"
      let fileURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(filename)
      do {
        try imageData.write(to: fileURL)
        return fileURL.path
      } catch {
        mapsLog("snapshot write failed", error)
        return nil
      }
    } else {
      let base64 = imageData.base64EncodedString()
      return "data:image/\(format);base64,\(base64)"
    }
  }
}
