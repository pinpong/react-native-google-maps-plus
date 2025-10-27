package com.rngooglemapsplus.extensions

import com.facebook.react.bridge.UiThreadUtil
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking

inline fun onUi(crossinline block: () -> Unit) {
  if (UiThreadUtil.isOnUiThread()) {
    block()
  } else {
    UiThreadUtil.runOnUiThread { block() }
  }
}

inline fun <T> onUiSync(crossinline block: () -> T): T {
  if (UiThreadUtil.isOnUiThread()) return block()
  val result = CompletableDeferred<T>()
  UiThreadUtil.runOnUiThread {
    runCatching(block).onSuccess(result::complete).onFailure(result::completeExceptionally)
  }
  return runBlocking { result.await() }
}
