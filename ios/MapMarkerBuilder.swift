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

  func build(_ m: RNMarker, icon: UIImage) -> GMSMarker {
    let marker = GMSMarker(
      position: CLLocationCoordinate2D(
        latitude: m.coordinate.latitude,
        longitude: m.coordinate.longitude
      )
    )
    marker.userData = m.id
    marker.tracksViewChanges = true
    marker.icon = icon
    marker.groundAnchor = CGPoint(
      x: m.anchor?.x ?? 0.5,
      y: m.anchor?.y ?? 0.5
    )
    if let zi = m.zIndex { marker.zIndex = Int32(zi) }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak marker] in
      marker?.tracksViewChanges = false
    }
    return marker
  }

  @MainActor
  func buildIconAsync(
    _ id: String,
    _ m: RNMarker,
    onReady: @escaping (UIImage?) -> Void
  ) {
    tasks[id]?.cancel()

    let key = m.styleHash()
    if let cached = iconCache.object(forKey: key) {
      onReady(cached)
      return
    }

    let task = Task(priority: .userInitiated) { [weak self] in
      guard let self else { return }
      defer {
        self.tasks.removeValue(forKey: id)
      }

      let img = await self.renderUIImage(m)
      guard let img, !Task.isCancelled else {
        return
      }

      self.iconCache.setObject(img, forKey: key)

      await MainActor.run {
        guard !Task.isCancelled else { return }
        onReady(img)
      }

    }

    tasks[id] = task
  }

  @MainActor
  func updateMarker(_ prev: RNMarker, _ next: RNMarker, _ m: GMSMarker) {
    m.position = CLLocationCoordinate2D(
      latitude: next.coordinate.latitude,
      longitude: next.coordinate.longitude
    )

    if let zi = next.zIndex { m.zIndex = Int32(zi) }

    m.groundAnchor = CGPoint(
      x: next.anchor?.x ?? 0.5,
      y: next.anchor?.y ?? 0.5
    )

    if !prev.markerStyleEquals(next) {
      buildIconAsync(next.id, next) { img in
        guard let img else { return }
        m.tracksViewChanges = true
        m.icon = img
        if prev.anchor?.x != next.anchor?.x || prev.anchor?.y != next.anchor?.y {
          m.groundAnchor = CGPoint(
            x: next.anchor?.x ?? 0.5,
            y: next.anchor?.y ?? 0.5
          )
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak m] in
          m?.tracksViewChanges = false
        }
      }
    }
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
    await withTaskCancellationHandler(
      operation: {
        await withCheckedContinuation { cont in
          queue.async {
            if Task.isCancelled {
              cont.resume(returning: nil)
              return
            }

            let targetW = max(1, Int(CGFloat(m.width)))
            let targetH = max(1, Int(CGFloat(m.height)))
            let size = CGSize(width: targetW, height: targetH)

            guard
              let data = m.iconSvg.data(using: .utf8),
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
