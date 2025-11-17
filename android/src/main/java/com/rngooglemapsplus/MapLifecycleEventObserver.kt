package com.rngooglemapsplus

import android.os.Bundle
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import com.google.android.gms.maps.MapView

class MapLifecycleEventObserver(
  private val mapView: MapView?,
  private val locationHandler: LocationHandler,
) : LifecycleEventObserver {
  private var currentState: Lifecycle.State = Lifecycle.State.INITIALIZED

  override fun onStateChanged(
    source: LifecycleOwner,
    event: Lifecycle.Event,
  ) {
    when (event) {
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
    while (currentState != state) {
      when {
        currentState < state -> upFromCurrentState()
        currentState > state -> downFromCurrentState()
      }
    }
  }

  private fun downFromCurrentState() {
    Lifecycle.Event.downFrom(currentState)?.also {
      invokeEvent(it)
    }
  }

  private fun upFromCurrentState() {
    Lifecycle.Event.upFrom(currentState)?.also {
      invokeEvent(it)
    }
  }

  private fun invokeEvent(event: Lifecycle.Event) {
    when (event) {
      Lifecycle.Event.ON_CREATE -> mapView?.onCreate(Bundle())
      Lifecycle.Event.ON_START -> mapView?.onStart()
      Lifecycle.Event.ON_RESUME -> {
        locationHandler.start()
        mapView?.onResume()
      }

      Lifecycle.Event.ON_PAUSE -> {
        mapView?.onPause()
        locationHandler.stop()
      }

      Lifecycle.Event.ON_STOP -> mapView?.onStop()
      Lifecycle.Event.ON_DESTROY -> mapView?.onDestroy()
      Lifecycle.Event.ON_ANY -> {}
    }
    currentState = event.targetState
  }
}
