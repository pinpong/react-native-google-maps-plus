extension RNSnapshotResultType {
  func isFileResult() -> Bool {
    switch self {
    case .file:
      return true
    case .base64:
      return false
    @unknown default:
      return false
    }
  }
}
