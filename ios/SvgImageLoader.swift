import Foundation

private let imageCacheBytes = 32 * 1024 * 1024
private let maxImageBytes = 8 * 1024 * 1024
private let timeout: TimeInterval = 5
private let maxRedirects = 5

private final class RedirectLimit: NSObject, URLSessionTaskDelegate {
  private let lock = NSLock()
  private var redirects = 0

  func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    willPerformHTTPRedirection response: HTTPURLResponse,
    newRequest request: URLRequest
  ) async -> URLRequest? {
    lock.withLock {
      redirects += 1
      return redirects <= maxRedirects ? request : nil
    }
  }
}

final class SvgImageLoader {
  private let mapErrorHandler: MapErrorHandler

  private let cache: NSCache<NSString, NSData> = {
    let c = NSCache<NSString, NSData>()
    c.totalCostLimit = imageCacheBytes
    return c
  }()

  private let lock = NSLock()
  private var downloads: [String: Task<Data, Error>] = [:]

  init(mapErrorHandler: MapErrorHandler) {
    self.mapErrorHandler = mapErrorHandler
  }

  func resolveImages(_ document: SvgDocument, markerId: String) async -> Bool {
    let images = await fetchAll(document.remoteImageHrefs, markerId: markerId)
    guard !Task.isCancelled else { return false }
    return applyImages(images, to: document, markerId: markerId)
  }

  @discardableResult
  func resolveCachedImages(_ document: SvgDocument, markerId: String) -> Bool {
    var images: [String: Data] = [:]
    for href in document.remoteImageHrefs {
      images[href] = cached(href)
    }
    return applyImages(images, to: document, markerId: markerId)
  }

  func prefetch(svg: String, markerId: String) async -> Bool {
    guard let document = SvgDocument(svg: svg, width: 1, height: 1) else { return false }
    let missing = document.remoteImageHrefs.filter { cached($0) == nil }
    let images = await fetchAll(missing, markerId: markerId)
    return !images.isEmpty
  }

  func clear() {
    cache.removeAllObjects()
  }

  private func cached(_ href: String) -> Data? {
    cache.object(forKey: href as NSString) as Data?
  }

  private func applyImages(_ images: [String: Data], to document: SvgDocument, markerId: String) -> Bool {
    var complete = true
    for (index, href) in document.remoteImageHrefs.enumerated() {
      guard let data = images[href] else {
        complete = false
        continue
      }
      if document.resolveImage(at: index, data: data) { continue }
      guard let png = data.toPng(), document.resolveImage(at: index, data: png) else {
        complete = false
        mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerId) remote svg image decode failed: \(href)")
        continue
      }
    }
    return complete
  }

  private func fetchAll(_ hrefs: [String], markerId: String) async -> [String: Data] {
    await withTaskGroup(of: (String, Data?).self) { group in
      for href in hrefs {
        group.addTask { [weak self] in
          (href, await self?.fetch(href, markerId: markerId))
        }
      }
      var images: [String: Data] = [:]
      for await (href, data) in group {
        images[href] = data
      }
      return images
    }
  }

  private func fetch(_ href: String, markerId: String) async -> Data? {
    if let data = cached(href) { return data }
    do {
      return try await sharedDownload(href).cancellableValue
    } catch {
      if !Task.isCancelled {
        mapErrorHandler.report(RNMapErrorCode.markerIconBuildFailed, "markerId=\(markerId) remote svg image fetch failed: \(href)", error)
      }
      return nil
    }
  }

  private func sharedDownload(_ href: String) -> Task<Data, Error> {
    lock.withLock {
      if let download = downloads[href] { return download }
      let download = Task { [weak self] in
        defer { self?.lock.withLock { self?.downloads[href] = nil } }
        let data = try await Self.download(href)
        self?.cache.setObject(data as NSData, forKey: href as NSString, cost: data.count)
        return data
      }
      downloads[href] = download
      return download
    }
  }

  private static func download(_ href: String) async throws -> Data {
    guard let url = URL(string: href) else { throw URLError(.badURL) }
    var request = URLRequest(url: url)
    request.timeoutInterval = timeout
    let (data, response) = try await URLSession.shared.data(for: request, delegate: RedirectLimit())
    if let http = response as? HTTPURLResponse, !(200 ... 299).contains(http.statusCode) {
      throw URLError(.badServerResponse)
    }
    guard data.count <= maxImageBytes else { throw URLError(.dataLengthExceedsMaximum) }
    return data
  }
}
