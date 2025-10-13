import GoogleMaps
import SVGKit
import UIKit

final class MapMarkerBuilder {
  private let iconCache = NSCache<NSString, UIImage>()
  private var tasks: [String: Task<Void, Never>] = [:]
  private let queue = DispatchQueue(
    label: "map.marker.render",
    qos: .userInitiated,
    attributes: .concurrent
  )

  func build(_ m: RNMarker, icon: UIImage?) -> GMSMarker {
    let marker = GMSMarker(
      position: m.coordinate.toCLLocationCoordinate2D()
    )
    marker.userData = m.id
    marker.tracksViewChanges = true
    marker.icon = icon
    m.title.map { marker.title = $0 }
    m.snippet.map { marker.snippet = $0 }
    m.opacity.map { marker.iconView?.alpha = CGFloat($0) }
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

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak marker] in
      marker?.tracksViewChanges = false
    }

    return marker
  }

  @MainActor
  func update(_ prev: RNMarker, _ next: RNMarker, _ m: GMSMarker) {
    if prev.coordinate.latitude != next.coordinate.latitude
      || prev.coordinate.longitude != next.coordinate.longitude {
      m.position = next.coordinate.toCLLocationCoordinate2D()
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

    if !prev.markerStyleEquals(next) {
      buildIconAsync(next.id, next) { img in
        m.tracksViewChanges = true
        m.icon = img

        if prev.anchor?.x != next.anchor?.x || prev.anchor?.y != next.anchor?.y{
          m.groundAnchor = CGPoint(
            x: next.anchor?.x ?? 0.5,
            y: next.anchor?.y ?? 1
          )
        }

        if prev.infoWindowAnchor?.x != next.infoWindowAnchor?.x
          || prev.infoWindowAnchor?.y != next.infoWindowAnchor?.y {
          m.infoWindowAnchor = CGPoint(
            x: next.infoWindowAnchor?.x ?? 0.5,
            y: next.infoWindowAnchor?.y ?? 0
          )
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak m] in
          m?.tracksViewChanges = false
        }
      }
    } else {
      if prev.anchor?.x != next.anchor?.x || prev.anchor?.y != next.anchor?.y{
        m.groundAnchor = CGPoint(
          x: next.anchor?.x ?? 0.5,
          y: next.anchor?.y ?? 1
        )
      }

      if prev.infoWindowAnchor?.x != next.infoWindowAnchor?.x
        || prev.infoWindowAnchor?.y != next.infoWindowAnchor?.y {
        m.infoWindowAnchor = CGPoint(
          x: next.infoWindowAnchor?.x ?? 0.5,
          y: next.infoWindowAnchor?.y ?? 0
        )
      }
    }
  }

  @MainActor
  func buildIconAsync(
    _ id: String,
    _ m: RNMarker,
    onReady: @escaping (UIImage?) -> Void
  ) {
    tasks[id]?.cancel()

    if m.iconSvg == nil {
      onReady(nil)
      return
    }

    let key = m.styleHash()
    if let cached = iconCache.object(forKey: key) {
      onReady(cached)
      return
    }

    let task = Task(priority: .userInitiated) { [weak self] in
      guard let self else { return }
      defer { self.tasks.removeValue(forKey: id) }

      let img = await self.renderUIImage(m)
      guard let img, !Task.isCancelled else { return }

      self.iconCache.setObject(img, forKey: key)

      await MainActor.run {
        guard !Task.isCancelled else { return }
        onReady(img)
      }
    }

    tasks[id] = task
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
  }

  private func renderUIImage(_ m: RNMarker) async -> UIImage? {
    guard let iconSvg = m.iconSvg else {
      return nil
    }

    return await withTaskCancellationHandler(
      operation: {
        await withCheckedContinuation {
          (cont: CheckedContinuation<UIImage?, Never>) in
          queue.async {
            if Task.isCancelled {
              cont.resume(returning: nil)
              return
            }

            let targetW = max(1, Int(CGFloat(iconSvg.width)))
            let targetH = max(1, Int(CGFloat(iconSvg.height)))
            let size = CGSize(width: targetW, height: targetH)

            guard
              let data = iconSvg.svgString.data(using: .utf8),
              let svgImg = SVGKImage(data: data)
            else {
              cont.resume(returning: nil)
              return
            }

            svgImg.size = size

            if Task.isCancelled {
              cont.resume(returning: nil)
              return
            }

            guard let base = svgImg.uiImage else {
              cont.resume(returning: nil)
              return
            }

            let scale = UIScreen.main.scale
            let img: UIImage
            if let cg = base.cgImage {
              img = UIImage(cgImage: cg, scale: scale, orientation: .up)
            } else {
              let fmt = UIGraphicsImageRendererFormat.default()
              fmt.opaque = false
              fmt.scale = scale
              let renderer = UIGraphicsImageRenderer(size: size, format: fmt)
              img = renderer.image { _ in
                base.draw(in: CGRect(origin: .zero, size: size))
              }
            }

            cont.resume(returning: img)
          }
        }

      },
      onCancel: {}
    )
  }
}
