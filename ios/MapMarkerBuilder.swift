import GoogleMaps
import SVGKit
import UIKit

final class MapMarkerBuilder {
  private let iconCache: NSCache<NSNumber, UIImage> = {
    let c = NSCache<NSNumber, UIImage>()
    c.countLimit = 512
    return c
  }()
  private var tasks: [String: Task<Void, Never>] = [:]

  @MainActor
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

  @MainActor
  func update(_ prev: RNMarker, _ next: RNMarker, _ m: GMSMarker) {
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
        onMain { [weak m] in
          guard let m = m else { return }

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

    if m.iconSvg == nil {
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

      let img = self.renderUIImage(m, scale)
      guard let img, !Task.isCancelled else { return }

      self.iconCache.setObject(img, forKey: key)

      await MainActor.run {
        guard !Task.isCancelled else { return }
        onReady(img)
      }
    }

    tasks[m.id] = task
  }

  @MainActor
  func cancelIconTask(_ id: String) {
    tasks[id]?.cancel()
    tasks.removeValue(forKey: id)
  }

  @MainActor
  func cancelAllIconTasks() {
    let ids = Array(tasks.keys)
    for id in ids {
      tasks[id]?.cancel()
    }
    tasks.removeAll()
    iconCache.removeAllObjects()
  }

  @MainActor
  func buildInfoWindow(iconSvg: RNMarkerSvg?) -> UIImageView? {
    guard let iconSvg = iconSvg else {
      return nil
    }

    guard let data = iconSvg.svgString.data(using: .utf8),
          let svgImg = SVGKImage(data: data)
    else {
      return nil
    }

    let size = CGSize(
      width: max(1, CGFloat(iconSvg.width)),
      height: max(1, CGFloat(iconSvg.height))
    )

    svgImg.size = size

    guard let finalImage = SVGKExporterUIImage.export(asUIImage: svgImg) else {
      svgImg.clear()
      return nil
    }
    svgImg.clear()

    let imageView = UIImageView(image: finalImage)
    imageView.frame = CGRect(origin: .zero, size: size)
    imageView.contentMode = .scaleAspectFit
    imageView.backgroundColor = .clear

    return imageView
  }

  private func renderUIImage(_ m: RNMarker, _ scale: CGFloat) -> UIImage? {
    guard
      let iconSvg = m.iconSvg,
      let data = iconSvg.svgString.data(using: .utf8)
    else { return nil }

    let size = CGSize(
      width: max(1, CGFloat(iconSvg.width)),
      height: max(1, CGFloat(iconSvg.height))
    )

    return autoreleasepool { () -> UIImage? in
      guard !Task.isCancelled else { return nil }
      guard let svgImg = SVGKImage(data: data) else { return nil }

      svgImg.size = size

      guard !Task.isCancelled else {
        svgImg.clear()
        return nil
      }

      let uiImage = SVGKExporterUIImage.export(asUIImage: svgImg)
      svgImg.clear()
      return uiImage
    }
  }

}
