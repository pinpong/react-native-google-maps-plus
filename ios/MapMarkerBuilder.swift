import GoogleMaps
import SVGKit
import UIKit

final class MapMarkerBuilder {
  private let iconCache: NSCache<NSNumber, UIImage> = {
    let c = NSCache<NSNumber, UIImage>()
    c.countLimit = 256
    return c
  }()
  private var tasks: [String: Task<Void, Never>] = [:]

  init() {
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

  func update(_ prev: RNMarker, _ next: RNMarker, _ m: GMSMarker) {
    onMain {
      withCATransaction(disableActions: true) {

        var tracksViewChanges = false
        var tracksInfoWindowChanges = false

        if !prev.coordinateEquals(next) {
          m.position = next.coordinate.toCLLocationCoordinate2D()
        }

        if !prev.markerStyleEquals(next) {
          self.buildIconAsync(next) { img in
            tracksViewChanges = true
            m.icon = img

            if !prev.anchorEquals(next) {
              m.groundAnchor = CGPoint(
                x: next.anchor?.x ?? 0.5,
                y: next.anchor?.y ?? 1
              )
            }

            if !prev.infoWindowAnchorEquals(next) {
              m.infoWindowAnchor = CGPoint(
                x: next.infoWindowAnchor?.x ?? 0.5,
                y: next.infoWindowAnchor?.y ?? 0
              )
            }
          }
        } else {
          if !prev.anchorEquals(next) {
            m.groundAnchor = CGPoint(
              x: next.anchor?.x ?? 0.5,
              y: next.anchor?.y ?? 1
            )
          }

          if !prev.infoWindowAnchorEquals(next) {
            m.infoWindowAnchor = CGPoint(
              x: next.infoWindowAnchor?.x ?? 0.5,
              y: next.infoWindowAnchor?.y ?? 0
            )
          }
        }

        if prev.title != next.title {
          tracksInfoWindowChanges = true
          m.title = next.title
        }

        if prev.snippet != next.snippet {
          tracksInfoWindowChanges = true
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

        if tracksViewChanges {
          m.tracksViewChanges = tracksViewChanges
        }
        if tracksInfoWindowChanges {
          m.tracksInfoWindowChanges = tracksInfoWindowChanges
        }

        if tracksViewChanges || tracksInfoWindowChanges {
          if tracksViewChanges {
            m.tracksViewChanges = false
          }

          if tracksInfoWindowChanges {
            m.tracksInfoWindowChanges = false
          }
        }
      }
    }
  }

  func buildIconAsync(
    _ m: RNMarker,
    onReady: @escaping (UIImage?) -> Void
  ) {
    tasks[m.id]?.cancel()

    guard let iconSvg = m.iconSvg else {
      onReady(nil)
      return
    }

    let key = m.styleHash()
    if let cached = iconCache.object(forKey: key) {
      onReady(cached)
      return
    }

    let scale = UIScreen.main.scale

    let task = Task(priority: .userInitiated) { [weak self] in
      guard let self else { return }
      defer {
        Task { @MainActor in self.tasks.removeValue(forKey: m.id) }
      }

      let renderResult = self.renderUIImage(iconSvg, m.id, scale)
      guard !Task.isCancelled else { return }

      guard let renderResult = renderResult else {
        await MainActor.run {
          guard !Task.isCancelled else { return }
          onReady(self.createFallbackUIImage())
        }
        return
      }

      if !renderResult.isFallback {
        self.iconCache.setObject(renderResult.image, forKey: key)
      }

      await MainActor.run {
        guard !Task.isCancelled else { return }
        onReady(renderResult.image)
      }
    }

    tasks[m.id] = task
  }

  func cancelIconTask(_ id: String) {
    tasks[id]?.cancel()
    tasks.removeValue(forKey: id)
  }

  func cancelAllIconTasks() {
    let ids = Array(tasks.keys)
    for id in ids {
      tasks[id]?.cancel()
    }
    tasks.removeAll()
    iconCache.removeAllObjects()
    CATransaction.flush()
  }

  func buildInfoWindow(markerTag: MarkerTag) -> UIImageView? {
    guard let iconSvg = markerTag.iconSvg else {
      return nil
    }

    let w = CGFloat(iconSvg.width)
    let h = CGFloat(iconSvg.height)

    if w <= 0 || h <= 0 {
      mapsLog("markerId=\(markerTag.id) icon: invalid svg size")
      return createFallbackImageView()
    }

    guard let data = iconSvg.svgString.data(using: .utf8),
          let svgImg = SVGKImage(data: data)
    else {
      mapsLog("markerId=\(markerTag.id) infoWindow: svg utf8 decode failed")
      return createFallbackImageView()
    }

    let size = CGSize(width: w, height: h)

    svgImg.size = size

    guard let finalImage = SVGKExporterUIImage.export(asUIImage: svgImg) else {
      mapsLog(
        "markerId=\(markerTag.id) infoWindow: svg export to UIImage failed"
      )
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
      mapsLog("markerId=\(markerId) icon: invalid svg size")
      return (createFallbackUIImage(), true)
    }

    guard
      let data = iconSvg.svgString.data(using: .utf8)
    else {
      mapsLog("markerId=\(markerId) icon: svg utf8 decode failed")
      return (createFallbackUIImage(), true)
    }

    let size = CGSize(width: w, height: h)

    return autoreleasepool { () -> (image: UIImage, isFallback: Bool)? in
      guard !Task.isCancelled else { return nil }

      guard let svgImg = SVGKImage(data: data) else {
        mapsLog("markerId=\(markerId) icon: SVGKImage init failed")
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
        return (createFallbackUIImage(), true)
      }
    }
  }
}
