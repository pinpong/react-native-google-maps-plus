import QuartzCore

@inline(__always)
func withCATransaction(
  disableActions: Bool = true,
  duration: CFTimeInterval? = nil,
  timingFunction: CAMediaTimingFunction? = nil,
  completion: (() -> Void)? = nil,
  _ body: @escaping () -> Void
) {
  onMain {
    CATransaction.begin()

    CATransaction.setDisableActions(disableActions)
    duration.map { CATransaction.setAnimationDuration($0) }
    timingFunction.map { CATransaction.setAnimationTimingFunction($0) }
    completion.map { CATransaction.setCompletionBlock($0) }

    body()
    CATransaction.commit()
  }
}

@inline(__always)
func onMain(
  _ block: @escaping () -> Void
) {
  if Thread.isMainThread {
    block()
  } else {
    Task { @MainActor in
      block()
    }
  }
}

@inline(__always)
func mapsLog(_ message: String) {
  NSLog("[react-native-google-maps-plus] %@", message)
}

@inline(__always)
func mapsLog(_ message: String, _ error: Error) {
  NSLog(
    "[react-native-google-maps-plus] %@ | %@",
    message,
    String(describing: error)
  )
}
