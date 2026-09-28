import Foundation

// lunasvg keeps fonts in a process wide cache, so they are registered once for all maps
private let registerLock = NSLock()
private var registered = false

final class SvgFontRegistry {
  private let mapErrorHandler: MapErrorHandler

  init(mapErrorHandler: MapErrorHandler) {
    self.mapErrorHandler = mapErrorHandler
  }

  func register() {
    registerLock.withLock {
      guard !registered else { return }
      registered = true
      let files = Bundle.main.object(forInfoDictionaryKey: "UIAppFonts") as? [String] ?? []
      for file in files {
        let url = Bundle.main.url(forResource: file, withExtension: nil)
        if url.map({ rn_svg_add_font_file($0.deletingPathExtension().lastPathComponent, $0.path) }) != true {
          mapErrorHandler.report(RNMapErrorCode.invalidArgument, "font register failed: \(file)")
        }
      }
    }
  }
}
