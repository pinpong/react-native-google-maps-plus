import QuartzCore

@MainActor @inline(__always)
func withCATransaction(
  disableActions: Bool = true,
  duration: CFTimeInterval? = nil,
  timingFunction: CAMediaTimingFunction? = nil,
  completion: (() -> Void)? = nil,
  _ body: @escaping @MainActor () -> Void
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

@MainActor @inline(__always)
func onMain(_ block: @escaping @MainActor () -> Void) {
  if Thread.isMainThread {
    block()
  } else {
    Task { @MainActor in block() }
  }
}

@inline(__always)
func onMainAsync(
  _ block: @MainActor @escaping () async -> Void
) {
  if Thread.isMainThread {
    Task { @MainActor in await block() }
  } else {
    Task { @MainActor in await block() }
  }
}
