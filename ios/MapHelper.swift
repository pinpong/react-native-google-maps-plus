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
  if disableActions { CATransaction.setDisableActions(true) }
  if let d = duration { CATransaction.setAnimationDuration(d) }
  if let tf = timingFunction { CATransaction.setAnimationTimingFunction(tf) }
  if let c = completion { CATransaction.setCompletionBlock(c) }
  body()
  CATransaction.commit()
}
