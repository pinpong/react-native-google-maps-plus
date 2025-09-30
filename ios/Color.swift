extension String {
  func toUIColor(default defaultColor: UIColor = .clear) -> UIColor {
    return UIColor.fromCssString(self) ?? defaultColor
  }
}

extension UIColor {
  static func fromCssString(_ s: String) -> UIColor? {
    let str = s.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    if str.hasPrefix("#") { return Self.fromHex(str) }
    if str.hasPrefix("rgb") { return Self.fromRGBFunction(str) }
    if str.hasPrefix("hsl") { return Self.fromHSLFunction(str) }
    if let named = namedColors[str] { return named }
    return nil
  }

  private static let namedColors: [String: UIColor] = [
    "red": .red, "green": .green, "blue": .blue,
    "black": .black, "white": .white, "gray": .gray, "grey": .gray,
    "yellow": .yellow, "orange": .orange, "purple": .purple,
    "cyan": .cyan, "aqua": .cyan, "magenta": .magenta, "fuchsia": .magenta,
    "brown": .brown, "clear": .clear, "transparent": .clear
  ]

  private static func fromHex(_ hex: String) -> UIColor? {
    var sanitized = hex.replacingOccurrences(of: "#", with: "")
    if sanitized.count == 3 || sanitized.count == 4 {
      sanitized = sanitized.map { "\($0)\($0)" }.joined()
    }
    if sanitized.count == 6 { sanitized += "ff" }
    guard sanitized.count == 8, let rgba = UInt32(sanitized, radix: 16) else {
      return nil
    }
    let r = CGFloat((rgba & 0xff00_0000) >> 24) / 255.0
    let g = CGFloat((rgba & 0x00ff_0000) >> 16) / 255.0
    let b = CGFloat((rgba & 0x0000_ff00) >> 8) / 255.0
    let a = CGFloat(rgba & 0x0000_00ff) / 255.0
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }

  private static func fromRGBFunction(_ s: String) -> UIColor? {
    let nums =
      s
      .replacingOccurrences(of: "rgba", with: "")
      .replacingOccurrences(of: "rgb", with: "")
      .replacingOccurrences(of: "(", with: "")
      .replacingOccurrences(of: ")", with: "")
      .split(separator: ",")
      .map { $0.trimmingCharacters(in: .whitespaces) }

    guard nums.count == 3 || nums.count == 4,
      let r = Double(nums[0]),
      let g = Double(nums[1]),
      let b = Double(nums[2])
    else { return nil }
    let a = (nums.count == 4) ? (Double(nums[3]) ?? 1.0) : 1.0
    return UIColor(
      red: CGFloat(r / 255.0),
      green: CGFloat(g / 255.0),
      blue: CGFloat(b / 255.0),
      alpha: CGFloat(a)
    )
  }

  private static func fromHSLFunction(_ s: String) -> UIColor? {
    let parts =
      s
      .replacingOccurrences(of: "hsla", with: "")
      .replacingOccurrences(of: "hsl", with: "")
      .replacingOccurrences(of: "(", with: "")
      .replacingOccurrences(of: ")", with: "")
      .replacingOccurrences(of: "%", with: "")
      .split(separator: ",")
      .map { $0.trimmingCharacters(in: .whitespaces) }

    guard parts.count == 3 || parts.count == 4,
      let h = Double(parts[0]),
      let sPerc = Double(parts[1]),
      let lPerc = Double(parts[2])
    else { return nil }

    let a = (parts.count == 4) ? (Double(parts[3]) ?? 1.0) : 1.0
    let s = sPerc / 100.0
    let l = lPerc / 100.0

    let c = (1 - Swift.abs(2 * l - 1)) * s
    let x = c * (1 - Swift.abs((h / 60).truncatingRemainder(dividingBy: 2) - 1))
    let m = l - c / 2

// swiftlint:disable:next large_tuple
    let (r1, g1, b1): (Double, Double, Double)
    switch h {
    case 0..<60: (r1, g1, b1) = (c, x, 0)
    case 60..<120: (r1, g1, b1) = (x, c, 0)
    case 120..<180: (r1, g1, b1) = (0, c, x)
    case 180..<240: (r1, g1, b1) = (0, x, c)
    case 240..<300: (r1, g1, b1) = (x, 0, c)
    case 300..<360: (r1, g1, b1) = (c, 0, x)
    default: (r1, g1, b1) = (0, 0, 0)
    }
    return UIColor(
      red: CGFloat(r1 + m),
      green: CGFloat(g1 + m),
      blue: CGFloat(b1 + m),
      alpha: CGFloat(a)
    )
  }

}
