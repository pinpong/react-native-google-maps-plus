package com.rngooglemapsplus

import android.content.Context
import android.view.MotionEvent
import android.widget.FrameLayout

abstract class GestureAwareFrameLayout(
  context: Context,
) : FrameLayout(context) {
  private var parentTouchInterceptDisallowed = false

  protected abstract val panGestureEnabled: Boolean
  protected abstract val multiTouchGestureEnabled: Boolean
  protected open val gesturesSupported: Boolean = true

  protected fun setParentTouchInterceptDisallowed(blocked: Boolean) {
    if (parentTouchInterceptDisallowed == blocked) return
    parentTouchInterceptDisallowed = blocked
    var p = parent
    while (p != null) {
      p.requestDisallowInterceptTouchEvent(blocked)
      p = p.parent
    }
  }

  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
    if (!gesturesSupported) return super.dispatchTouchEvent(ev)

    val anyGestureEnabled = panGestureEnabled || multiTouchGestureEnabled
    if (!anyGestureEnabled) return super.dispatchTouchEvent(ev)

    when (ev.actionMasked) {
      MotionEvent.ACTION_DOWN,
      MotionEvent.ACTION_MOVE,
      MotionEvent.ACTION_POINTER_DOWN,
      -> {
        val pointers = ev.pointerCount
        val shouldBlockParent = pointers >= (if (panGestureEnabled) 1 else 2)
        setParentTouchInterceptDisallowed(shouldBlockParent)
      }

      MotionEvent.ACTION_POINTER_UP -> {
        val pointers = ev.pointerCount - 1
        val shouldBlockParent = pointers >= (if (panGestureEnabled) 1 else 2)
        setParentTouchInterceptDisallowed(shouldBlockParent)
      }

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL,
      -> {
        setParentTouchInterceptDisallowed(false)
      }
    }

    return super.dispatchTouchEvent(ev)
  }
}
