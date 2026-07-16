import GoogleMaps
import SVGKit
import UIKit

final class MapMarkerBuilder {
  private let mapErrorHandler: MapErrorHandler

  private let iconCache: NSCache<NSNumber, UIImage> = {
    let c = NSCache<NSNumber, UIImage>()
    c.countLimit = 256
    return c
  }()

  init(mapErrorHandler: MapErrorHandler) {
    self.mapErrorHandler = mapErrorHandler
    warmupSVGKit()
  }

  func build(_ m: RNMarker, icon: UIImage?) -> GMSMarker {
    let marker = GMSMarker(
      position: m.coordinate.toCLLocationCoordinate2D()
    )
    marker.icon = icon
    m.title.map { marker.title = $0 }
    m.snippet.map { marker.snippet = $0 }
    m.opacity.map {
      marker.opacity = Float($0)
      marker.iconView?.alpha = CGFloat($0)
    }
    m.flat.map { marker.isFlat = $0 }
    m.draggable.map { marker.isDraggable = $0 }
    m.rotation.map { marker.rotation = $0 }
    m.infoWindowAnchor.map {
      marker.infoWindowAnchor = CGPoint(x: $0.x, y: $0.y)
    }
    m.anchor.map {
      marker.groundAnchor = CGPoint(
        x: $0.x,
        y: $0.y
      )
    }
    m.zIndex.map { marker.zIndex = Int32($0) }

    marker.tagData = MarkerTag(
      id: m.id,
      iconSvg: m.infoWindowIconSvg
    )

    return marker
  }

  func update(_ prev: RNMarker, _ next: RNMarker, _ m: GMSMarker, deferAnchors: Bool = false) {
    onMain {
      withCATransaction(disableActions: true) {

        if !prev.coordinateEquals(next) {
          m.position = next.coordinate.toCLLocationCoordinate2D()
        }

        if !deferAnchors, !prev.anchorEquals(next) {
          m.groundAnchor = CGPoint(
            x: next.anchor?.x ?? 0.5,
            y: next.anchor?.y ?? 1
          )
        }

        if !deferAnchors, !prev.infoWindowAnchorEquals(next) {
          m.infoWindowAnchor = CGPoint(
            x: next.infoWindowAnchor?.x ?? 0.5,
            y: next.infoWindowAnchor?.y ?? 0
          )
        }

        if prev.title != next.title {
          m.title = next.title
        }

        if prev.snippet != next.snippet {
          m.snippet = next.snippet
        }

        if prev.opacity != next.opacity {
          let opacity = Float(next.opacity ?? 1)
          m.opacity = opacity
          m.iconView?.alpha = CGFloat(opacity)
        }

        if prev.flat != next.flat {
          m.isFlat = next.flat ?? false
        }

        if prev.draggable != next.draggable {
          m.isDraggable = next.draggable ?? false
        }

        if prev.rotation != next.rotation {
          m.rotation = next.rotation ?? 0
        }

        if prev.zIndex != next.zIndex {
          m.zIndex = Int32(next.zIndex ?? 0)
        }

        if !prev.markerInfoWindowStyleEquals(next) {
          m.tagData = MarkerTag(
            id: next.id,
            iconSvg: next.infoWindowIconSvg
          )
        }
      }
    }
  }

  func applyAnchors(_ m: RNMarker, _ marker: GMSMarker) {
    marker.groundAnchor = CGPoint(
      x: m.anchor?.x ?? 0.5,
      y: m.anchor?.y ?? 1
    )
    marker.infoWindowAnchor = CGPoint(
      x: m.infoWindowAnchor?.x ?? 0.5,
      y: m.infoWindowAnchor?.y ?? 0
    )
  }

  func cachedIcon(styleHash: NSNumber) -> UIImage? {
    iconCache.object(forKey: styleHash)
  }

  func clearIconCache() {
    iconCache.removeAllObjects()
  }

  func renderIcon(
    markerId: String,
    iconSvg: RNMarkerSvg,
    styleHash: NSNumber,
    onReady: @escaping (UIImage) -> Void
  ) -> Task<Void, Never> {
    let scale = UIScreen.main.scale

    return Task(priority: .userInitiated) { [weak self] in
      guard let self else { return }

      let renderResult = self.renderUIImage(iconSvg, markerId, scale)
      guard !Task.isCancelled else { return }

      guard let renderResult = renderResult else {
        await MainActor.run {
          guard !Task.isCancelled else { return }
          onReady(self.createFallbackUIImage())
        }
        return
      }

      if !renderResult.isFallback {
        self.iconCache.setObject(renderResult.image, forKey: styleHash)
      }

      await MainActor.run {
        guard !Task.isCancelled else { return }
        onReady(renderResult.image)
      }
    }
  }

  func buildInfoWindow(markerTag: MarkerTag) -> UIImageView? {
    guard let iconSvg = markerTag.iconSvg else {
      return nil
    }

    let w = CGFloat(iconSvg.width)
    let h = CGFloat(iconSvg.height)

    if w <= 0 || h <= 0 {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerTag.id) icon: invalid svg size")
      return createFallbackImageView()
    }

    guard let data = iconSvg.svgString.data(using: .utf8),
          let svgImg = SVGKImage(data: data)
    else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerTag.id) infoWindow: svg utf8 decode failed")
      return createFallbackImageView()
    }

    let size = CGSize(width: w, height: h)

    svgImg.size = size

    guard let finalImage = SVGKExporterUIImage.export(asUIImage: svgImg) else {
      mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerTag.id) infoWindow: svg export to UIImage failed")
      svgImg.clear()
      return createFallbackImageView()
    }
    svgImg.clear()

    let imageView = UIImageView(image: finalImage)
    imageView.frame = CGRect(origin: .zero, size: size)
    imageView.contentMode = .scaleAspectFit
    imageView.backgroundColor = .clear

    return imageView
  }

  private func warmupSVGKit() {
    autoreleasepool {
      let emptySvg = """
      <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>
      """
      guard let data = emptySvg.data(using: .utf8),
            let svgImg = SVGKImage(data: data)
      else { return }
      svgImg.clear()
    }
  }

  private func createFallbackUIImage() -> UIImage {
    let size = CGSize(width: 1, height: 1)
    let renderer = UIGraphicsImageRenderer(size: size)
    return renderer.image { _ in }
  }

  private func createFallbackImageView() -> UIImageView {
    let iv = UIImageView(image: createFallbackUIImage())
    iv.contentMode = .scaleAspectFit
    iv.backgroundColor = .clear
    return iv
  }

  private func renderUIImage(
    _ iconSvg: RNMarkerSvg,
    _ markerId: String,
    _ scale: CGFloat
  ) -> (
    image: UIImage, isFallback: Bool
  )? {

    let w = CGFloat(iconSvg.width)
    let h = CGFloat(iconSvg.height)

    if w <= 0 || h <= 0 {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerId) icon: invalid svg size")
      return (createFallbackUIImage(), true)
    }

    guard
      let data = iconSvg.svgString.data(using: .utf8)
    else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerId) icon: svg utf8 decode failed")
      return (createFallbackUIImage(), true)
    }

    let size = CGSize(width: w, height: h)

    return autoreleasepool { () -> (image: UIImage, isFallback: Bool)? in
      guard !Task.isCancelled else { return nil }

      CATransaction.begin()
      defer { CATransaction.commit() }

      guard let svgImg = SVGKImage(data: data) else {
        mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerId) icon: SVGKImage init failed")
        return (createFallbackUIImage(), true)
      }

      svgImg.size = size

      guard !Task.isCancelled else {
        svgImg.clear()
        return nil
      }

      let uiImage = SVGKExporterUIImage.export(asUIImage: svgImg)
      svgImg.clear()

      guard !Task.isCancelled else { return nil }

      if let uiImage = uiImage {
        return (uiImage, false)
      } else {
        mapErrorHandler.report(.markerIconBuildFailed, "markerId=\(markerId) icon: svg export to UIImage failed")
        return (createFallbackUIImage(), true)
      }
    }
  }
}
