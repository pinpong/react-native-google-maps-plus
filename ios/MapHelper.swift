import QuartzCore

@inline(__always)
func withCATransaction(
  disableActions: Bool = true,
  duration: CFTimeInterval? = nil,
  timingFunction: CAMediaTimingFunction? = nil,
  completion: (() -> Void)? = nil,
  _ body: () -> Void
) {
  CATransaction.begin()

  CATransaction.setDisableActions(disableActions)
  duration.map { CATransaction.setAnimationDuration($0) }
  timingFunction.map { CATransaction.setAnimationTimingFunction($0) }
  completion.map { CATransaction.setCompletionBlock($0) }

  body()
  CATransaction.commit()
}
