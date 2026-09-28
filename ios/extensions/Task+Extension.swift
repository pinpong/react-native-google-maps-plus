import Foundation

private final class TaskWaiter<Success> {
  private let lock = NSLock()
  private var continuation: CheckedContinuation<Success, Error>?
  private var result: Result<Success, Error>?

  func start(_ continuation: CheckedContinuation<Success, Error>) {
    let finished = lock.withLock {
      if result == nil { self.continuation = continuation }
      return result
    }
    finished.map { continuation.resume(with: $0) }
  }

  func finish(_ result: Result<Success, Error>) {
    let waiting: CheckedContinuation<Success, Error>? = lock.withLock {
      guard self.result == nil else { return nil }
      self.result = result
      defer { continuation = nil }
      return continuation
    }
    waiting?.resume(with: result)
  }

  func cancel() {
    finish(.failure(CancellationError()))
  }
}

extension Task where Failure == Error {
  var cancellableValue: Success {
    get async throws {
      let waiter = TaskWaiter<Success>()
      return try await withTaskCancellationHandler {
        try await withCheckedThrowingContinuation { continuation in
          waiter.start(continuation)
          Task<Void, Never> { waiter.finish(await self.result) }
        }
      } onCancel: {
        waiter.cancel()
      }
    }
  }
}
