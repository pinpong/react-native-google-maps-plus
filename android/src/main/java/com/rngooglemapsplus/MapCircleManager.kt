package com.rngooglemapsplus

import CircleTag
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.Circle
import com.rngooglemapsplus.extensions.circleEquals

private class CircleState(
  var current: RNCircle,
) {
  var circle: Circle? = null
}

class MapCircleManager(
  private val builder: MapCircleBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, CircleState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.circle == null }.forEach { addToMap(it) }
    }

  fun add(circle: RNCircle) =
    onUi {
      if (destroyed) return@onUi
      states.remove(circle.id)?.let { removeFromMap(it) }
      val state = CircleState(circle)
      states[circle.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNCircle) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      val prev = state.current
      if (prev.circleEquals(next)) return@onUi
      state.current = next
      state.circle?.let { builder.update(prev, next, it) }
    }

  fun remove(id: String) =
    onUi {
      states.remove(id)?.let { removeFromMap(it) }
    }

  fun destroy() =
    onUi {
      destroyed = true
      states.values.forEach { removeFromMap(it) }
      states.clear()
      map = null
    }

  private fun addToMap(state: CircleState) {
    state.circle =
      map?.addCircle(builder.build(state.current))?.apply {
        tag = CircleTag(id = state.current.id)
      }
  }

  private fun removeFromMap(state: CircleState) {
    state.circle?.remove()
  }
}
