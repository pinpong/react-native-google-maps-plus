import GoogleMaps
import UIKit

final class MapMarkerBuilder {
  private let mapErrorHandler: MapErrorHandler

  private let iconCache: NSCache<NSNumber, UIImage> = {
    let c = NSCache<NSNumber, UIImage>()
    c.countLimit = 256
    return c
  }()

  private let imageLoader: SvgImageLoader
  private let fontRegistry: SvgFontRegistry
  private let displayScale: CGFloat

  init(mapErrorHandler: MapErrorHandler) {
    self.mapErrorHandler = mapErrorHandler
    imageLoader = SvgImageLoader(mapErrorHandler: mapErrorHandler)
    fontRegistry = SvgFontRegistry(mapErrorHandler: mapErrorHandler)
    displayScale = UIScreen.main.scale
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
    withCATransaction(disableActions: true) {
      if !prev.coordinatesEquals(next) {
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
    imageLoader.clear()
  }

  func renderIcon(
    markerId: String,
    iconSvg: RNMarkerSvg,
    styleHash: NSNumber,
    onReady: @escaping (UIImage) -> Void
  ) -> Task<Void, Never> {
    Task(priority: .userInitiated) { [weak self] in
      guard let self else { return }

      let renderResult = await self.renderUIImage(iconSvg, markerId)
      guard !Task.isCancelled else { return }

      guard let renderResult else {
        await MainActor.run {
          guard !Task.isCancelled else { return }
          onReady(self.createFallbackUIImage())
        }
        return
      }

      if renderResult.cacheable {
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

    guard let pixelSize = iconSvg.toPixelSize(scale: displayScale) else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerTag.id) infoWindow: invalid svg size")
      return createFallbackImageView()
    }

    guard let document = parse(iconSvg, pixelSize: pixelSize) else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerTag.id) infoWindow: svg parse failed")
      return createFallbackImageView()
    }

    imageLoader.resolveCachedImages(document, markerId: markerTag.id)

    guard let finalImage = document.render(scale: displayScale) else {
      mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerTag.id) infoWindow: svg render failed")
      return createFallbackImageView()
    }

    let imageView = UIImageView(image: finalImage)
    imageView.frame = CGRect(origin: .zero, size: finalImage.size)
    imageView.contentMode = .scaleAspectFit
    imageView.backgroundColor = .clear

    return imageView
  }

  func prefetchInfoWindowImages(
    markerId: String,
    iconSvg: RNMarkerSvg,
    onLoaded: @escaping () -> Void
  ) -> Task<Void, Never> {
    Task(priority: .utility) { [weak self] in
      guard let self else { return }
      let loaded = await self.imageLoader.prefetch(svg: iconSvg.svgString, markerId: markerId)
      guard loaded, !Task.isCancelled else { return }
      await MainActor.run {
        guard !Task.isCancelled else { return }
        onLoaded()
      }
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
    _ markerId: String
  ) async -> (
    image: UIImage, cacheable: Bool
  )? {
    guard let pixelSize = iconSvg.toPixelSize(scale: displayScale) else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerId) icon: invalid svg size")
      return (createFallbackUIImage(), false)
    }

    guard !Task.isCancelled else { return nil }

    guard let document = parse(iconSvg, pixelSize: pixelSize) else {
      mapErrorHandler.report(RNMapErrorCode.invalidArgument, "markerId=\(markerId) icon: svg parse failed")
      return (createFallbackUIImage(), false)
    }

    let complete = await imageLoader.resolveImages(document, markerId: markerId)

    guard !Task.isCancelled else { return nil }

    guard let uiImage = document.render(scale: displayScale) else {
      mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerId) icon: svg render failed")
      return (createFallbackUIImage(), false)
    }
    return (uiImage, complete)
  }

  private func parse(_ iconSvg: RNMarkerSvg, pixelSize: (width: Int, height: Int)) -> SvgDocument? {
    fontRegistry.register()
    return SvgDocument(svg: iconSvg.svgString, width: pixelSize.width, height: pixelSize.height)
  }
}
