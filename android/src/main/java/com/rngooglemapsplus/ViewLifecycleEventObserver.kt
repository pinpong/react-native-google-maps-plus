package com.rngooglemapsplus

import android.os.Bundle
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner

class ViewLifecycleEventObserver(
  private val locationHandler: LocationHandler,
  private val onCreateView: (Bundle) -> Unit,
  private val onStartView: () -> Unit,
  private val onResumeView: () -> Unit,
  private val onPauseView: () -> Unit,
  private val onStopView: () -> Unit,
  private val onDestroyView: () -> Unit,
) : LifecycleEventObserver {
  private var currentState: Lifecycle.State = Lifecycle.State.INITIALIZED

  override fun onStateChanged(
    source: LifecycleOwner,
    event: Lifecycle.Event,
  ) {
    when (event) {
      // Host destroy does not necessarily mean the RN view is dropped.
      // The actual MapView destroy is driven explicitly from view cleanup.
      Lifecycle.Event.ON_DESTROY -> toCreatedState()

      else -> toState(event.targetState)
    }
  }

  fun toCreatedState() {
    if (currentState > Lifecycle.State.CREATED) {
      toState(Lifecycle.State.CREATED)
    }
  }

  fun toDestroyedState() {
    if (currentState > Lifecycle.State.INITIALIZED) {
      toState(Lifecycle.State.DESTROYED)
    }
  }

  private fun toState(state: Lifecycle.State) {
    if (currentState == Lifecycle.State.DESTROYED) return
    while (currentState != state) {
      when {
        currentState < state -> upFromCurrentState()
        currentState > state -> downFromCurrentState()
      }
    }
  }

  private fun downFromCurrentState() {
    Lifecycle.Event.downFrom(currentState)?.also { invokeEvent(it) }
  }

  private fun upFromCurrentState() {
    Lifecycle.Event.upFrom(currentState)?.also { invokeEvent(it) }
  }

  private fun invokeEvent(event: Lifecycle.Event) {
    when (event) {
      Lifecycle.Event.ON_CREATE -> {
        onCreateView(Bundle())
      }

      Lifecycle.Event.ON_START -> {
        onStartView()
      }

      Lifecycle.Event.ON_RESUME -> {
        locationHandler.start()
        onResumeView()
      }

      Lifecycle.Event.ON_PAUSE -> {
        onPauseView()
        locationHandler.stop()
      }

      Lifecycle.Event.ON_STOP -> {
        onStopView()
      }

      Lifecycle.Event.ON_DESTROY -> {
        onDestroyView()
      }

      Lifecycle.Event.ON_ANY -> {}
    }
    currentState = event.targetState
  }
}
