import UIKit

final class SvgDocument {
  private let handle: OpaquePointer
  private let width: Int
  private let height: Int

  init?(svg: String, width: Int, height: Int) {
    guard let documentWidth = Int32(exactly: width),
          let documentHeight = Int32(exactly: height),
          let handle = svg.withCString({
            rn_svg_document_create($0, svg.utf8.count, documentWidth, documentHeight)
          }) else { return nil }
    self.handle = handle
    self.width = width
    self.height = height
  }

  deinit {
    rn_svg_document_destroy(handle)
  }

  var remoteImageHrefs: [String] {
    (0 ..< rn_svg_document_remote_image_count(handle)).compactMap {
      rn_svg_document_remote_image_href(handle, $0).map { String(cString: $0) }
    }
  }

  func resolveImage(at index: Int, data: Data) -> Bool {
    data.withUnsafeBytes { bytes in
      guard let base = bytes.baseAddress else { return false }
      return rn_svg_document_resolve_image(handle, index, base, bytes.count)
    }
  }

  func render(scale: CGFloat) -> UIImage? {
    guard let context = CGContext(
      data: nil,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ),
      let pixels = context.data,
      rn_svg_document_render(handle, pixels, Int32(width), Int32(height), Int32(context.bytesPerRow), false),
      let cgImage = context.makeImage()
    else {
      return nil
    }
    return UIImage(cgImage: cgImage, scale: scale, orientation: .up)
  }
}
