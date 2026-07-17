package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.Polyline
import com.rngooglemapsplus.extensions.polylineEquals

private class PolylineState(
  var current: RNPolyline,
) {
  var polyline: Polyline? = null
}

class MapPolylineManager(
  private val builder: MapPolylineBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, PolylineState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.polyline == null }.forEach { addToMap(it) }
    }

  fun add(polyline: RNPolyline) =
    onUi {
      if (destroyed) return@onUi
      remove(polyline.id)
      val state = PolylineState(polyline)
      states[polyline.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNPolyline) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      val prev = state.current
      if (prev.polylineEquals(next)) return@onUi
      state.current = next
      state.polyline?.let { builder.update(prev, next, it) }
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

  private fun addToMap(state: PolylineState) {
    state.polyline =
      map?.addPolyline(builder.build(state.current))?.apply {
        tag = PolylineTag(id = state.current.id)
      }
  }

  private fun removeFromMap(state: PolylineState) {
    state.polyline?.remove()
  }
}
