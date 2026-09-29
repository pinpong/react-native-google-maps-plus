import CoreText
import Foundation
import UIKit

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
      registerSystemFont()
      registerFallbackFonts()
      rn_svg_set_fallback_font_resolver(resolveFallbackFont)
      rn_svg_set_text_image_renderer(renderTextImage)
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

// text without a font-family and the generic sans-serif families use the system font, as they do on Android
private func registerSystemFont() {
  let systemFont = CTFontCreateUIFontForLanguage(.system, 0, nil) ?? CTFontCreateWithName("Helvetica" as CFString, 0, nil)
  let italicFont = CTFontCreateCopyWithSymbolicTraits(systemFont, 0, nil, .traitItalic, .traitItalic)
  for (font, italic) in [(systemFont, false), (italicFont, true)] {
    guard let font, let url = CTFontCopyAttribute(font, kCTFontURLAttribute) as? URL else { continue }
    for family in ["", "sans-serif", "system-ui"] {
      rn_svg_add_font_face_file(family, false, italic, url.path)
    }
  }
}

// the cascade list is the order in which CoreText falls back from the system font, it only has fonts for the given
// languages, so the CJK languages are added; it covers fonts that the resolver picks but lunasvg can't read
private func registerFallbackFonts() {
  let systemFont = CTFontCreateUIFontForLanguage(.system, 0, nil) ?? CTFontCreateWithName("Helvetica" as CFString, 0, nil)
  let languages = Locale.preferredLanguages + ["zh-Hans", "zh-Hant", "ja", "ko"]
  let cascade = CTFontCopyDefaultCascadeListForLanguages(systemFont, languages as CFArray) as? [CTFontDescriptor] ?? []
  for descriptor in cascade {
    let font = CTFontCreateWithFontDescriptor(descriptor, 0, nil)
    guard let url = CTFontCopyAttribute(font, kCTFontURLAttribute) as? URL else { continue }
    let fontLanguages = CTFontDescriptorCopyAttribute(descriptor, kCTFontLanguagesAttribute) as? [String] ?? []
    rn_svg_add_fallback_font_file("", url.path, 0, CTFontCopyPostScriptName(font) as String, fontLanguages.joined(separator: ","), false)
  }
}

// CoreText picks the font it would draw the character with in the system font and the language
private func resolveFallbackFont(
  codepoint: UInt32,
  language: UnsafePointer<CChar>,
  serif: Bool,
  path: UnsafeMutablePointer<CChar>,
  pathSize: Int,
  postScriptName: UnsafeMutablePointer<CChar>,
  postScriptNameSize: Int
) -> Bool {
  guard let scalar = Unicode.Scalar(codepoint) else { return false }
  // lunasvg asks with the emoji script tag for characters followed by the emoji variation selector
  let languageTag = String(cString: language)
  let emoji = languageTag == "und-Zsye"
  let text = (String(Character(scalar)) + (emoji ? "\u{FE0F}" : "")) as CFString
  let systemFont = serif ? systemSerifFont() : CTFontCreateUIFontForLanguage(.system, 0, nil) ?? CTFontCreateWithName("Helvetica" as CFString, 0, nil)
  let range = CFRange(location: 0, length: CFStringGetLength(text))
  let font = languageTag.isEmpty || emoji
    ? CTFontCreateForString(systemFont, text, range)
    : CTFontCreateForStringWithLanguage(systemFont, text, range, languageTag as CFString)
  guard let url = CTFontCopyAttribute(font, kCTFontURLAttribute) as? URL else { return false }
  strlcpy(path, url.path, pathSize)
  strlcpy(postScriptName, CTFontCopyPostScriptName(font) as String, postScriptNameSize)
  return true
}

private let fontDescriptorLock = NSLock()
private var fontDescriptors: [String: CTFontDescriptor] = [:]

private func font(path: String, postScriptName: String, size: CGFloat) -> CTFont? {
  fontDescriptor(path: path, postScriptName: postScriptName).map { CTFontCreateWithFontDescriptor($0, size, nil) }
}

private func fontDescriptor(path: String, postScriptName: String) -> CTFontDescriptor? {
  fontDescriptorLock.withLock {
    let key = path + "|" + postScriptName
    if let descriptor = fontDescriptors[key] { return descriptor }
    let url = URL(fileURLWithPath: path) as CFURL
    let descriptors = CTFontManagerCreateFontDescriptorsFromURL(url) as? [CTFontDescriptor] ?? []
    let descriptor = descriptors.first {
      CTFontDescriptorCopyAttribute($0, kCTFontNameAttribute) as? String == postScriptName
    } ?? descriptors.first
    fontDescriptors[key] = descriptor
    return descriptor
  }
}

// CoreText shapes and draws text in fonts lunasvg can't read, like Apple Color Emoji, whose layout and images iOS
// keeps from apps
private func renderTextImage(
  path: UnsafePointer<CChar>,
  postScriptName: UnsafePointer<CChar>,
  text: UnsafePointer<UInt32>,
  length: Int32,
  size: Float,
  weight: Int32,
  italic: Bool,
  color: UInt32,
  advance: UnsafeMutablePointer<Float>,
  image: UnsafeMutablePointer<RNSvgTextImage>?
) -> Bool {
  guard let baseFont = font(path: String(cString: path), postScriptName: String(cString: postScriptName), size: CGFloat(size)) else {
    return false
  }
  let (font, syntheticBold) = styledFont(baseFont, bold: weight >= 600, italic: italic)
  var string = ""
  string.unicodeScalars.append(contentsOf: UnsafeBufferPointer(start: text, count: Int(length)).compactMap(Unicode.Scalar.init))
  let channel = { (shift: UInt32) in CGFloat((color >> shift) & 0xFF) / 255 }
  let foreground = CGColor(red: channel(16), green: channel(8), blue: channel(0), alpha: channel(24))
  var attributeValues: [CFString: Any] = [kCTFontAttributeName: font, kCTForegroundColorAttributeName: foreground]
  // a negative stroke width fills and strokes, which is how UIKit makes fonts without bold look bold
  if syntheticBold { attributeValues[kCTStrokeWidthAttributeName] = -3.0 }
  let attributes = attributeValues as CFDictionary
  guard let attributed = CFAttributedStringCreate(nil, string as CFString, attributes) else { return false }
  let line = CTLineCreateWithAttributedString(attributed)
  var ascent: CGFloat = 0
  var descent: CGFloat = 0
  let width = CTLineGetTypographicBounds(line, &ascent, &descent, nil)
  advance.pointee = Float(width)
  guard let image else { return true }

  let lineBox = CGRect(x: 0, y: -descent, width: width, height: ascent + descent)
  let bounds = lineBox.union(CTLineGetBoundsWithOptions(line, .useGlyphPathBounds)).integral.insetBy(dx: -1, dy: -1)
  let pixelWidth = Int(bounds.width)
  let pixelHeight = Int(bounds.height)
  guard pixelWidth > 0, pixelHeight > 0, let data = calloc(pixelWidth * pixelHeight, 4) else { return false }
  let bitmapInfo = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
  guard let context = CGContext(
    data: data, width: pixelWidth, height: pixelHeight, bitsPerComponent: 8, bytesPerRow: pixelWidth * 4,
    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: bitmapInfo
  ) else {
    free(data)
    return false
  }
  context.textPosition = CGPoint(x: -bounds.minX, y: -bounds.minY)
  CTLineDraw(line, context)
  image.pointee = RNSvgTextImage(
    data: data.assumingMemoryBound(to: UInt8.self), width: Int32(pixelWidth), height: Int32(pixelHeight),
    stride: Int32(pixelWidth * 4), left: Float(bounds.minX), top: Float(bounds.maxY)
  )
  return true
}

// the bold and italic faces of the font, or a slant for italic and a flag for bold when it has none
private func styledFont(_ font: CTFont, bold: Bool, italic: Bool) -> (CTFont, Bool) {
  var traits: CTFontSymbolicTraits = []
  if bold { traits.insert(.traitBold) }
  if italic { traits.insert(.traitItalic) }
  var styled = CTFontCreateCopyWithSymbolicTraits(font, 0, nil, traits, traits) ?? font
  let found = CTFontGetSymbolicTraits(styled)
  if italic, !found.contains(.traitItalic) {
    var slant = CGAffineTransform(a: 1, b: 0, c: 0.25, d: 1, tx: 0, ty: 0)
    styled = CTFontCreateCopyWithAttributes(styled, 0, &slant, nil)
  }
  return (styled, bold && !found.contains(.traitBold))
}

// New York, the serif design of the system font
private func systemSerifFont() -> CTFont {
  let descriptor = UIFont.systemFont(ofSize: 0).fontDescriptor.withDesign(.serif) ?? UIFont.systemFont(ofSize: 0).fontDescriptor
  return CTFontCreateWithFontDescriptor(descriptor as CTFontDescriptor, 0, nil)
}
