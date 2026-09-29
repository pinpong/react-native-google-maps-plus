import GoogleMaps

extension RNMarkerPinConfig {
  func toGMSPinImageOptions(glyphImage: UIImage?) -> GMSPinImageOptions {
    let options = GMSPinImageOptions()
    backgroundColor.map { options.backgroundColor = $0.toUIColor() }
    borderColor.map { options.borderColor = $0.toUIColor() }
    glyph?.toGMSPinImageGlyph(image: glyphImage).map { options.glyph = $0 }
    return options
  }
}

extension RNMarkerPinGlyph {
  func toGMSPinImageGlyph(image: UIImage?) -> GMSPinImageGlyph? {
    image.map { GMSPinImageGlyph(image: $0) }
      ?? text.map { GMSPinImageGlyph(text: $0, textColor: textColor?.toUIColor() ?? .black) }
      ?? color.map { GMSPinImageGlyph(glyphColor: $0.toUIColor()) }
  }
}
