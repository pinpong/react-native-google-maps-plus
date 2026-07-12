import Foundation

final class MarkerBuildToken {
  private let lock = NSLock()
  private var task: Task<Void, Never>?
  private var cancelled = false

  func setTask(_ task: Task<Void, Never>) {
    lock.lock()
    let shouldCancel = cancelled
    if !shouldCancel {
      self.task = task
    }
    lock.unlock()

    if shouldCancel {
      task.cancel()
    }
  }

  func cancel() {
    lock.lock()
    cancelled = true
    let activeTask = task
    task = nil
    lock.unlock()

    activeTask?.cancel()
  }
}
