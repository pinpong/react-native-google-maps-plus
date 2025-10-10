enum ImageFormat {
  case png
  case jpeg
}

extension RNSnapshotFormat {
  func toImageFormat() -> ImageFormat {
    switch self {
    case .jpg, .jpeg:
      return .jpeg
    case .png:
      return .png
    @unknown default:
      return .png
    }
  }

  func toFileExtension() -> String {
    switch self {
    case .jpg, .jpeg:
      return "jpg"
    case .png:
      return "png"
    @unknown default:
      return "png"
    }
  }
}
