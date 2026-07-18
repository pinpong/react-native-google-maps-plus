package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.Polygon
import com.rngooglemapsplus.extensions.polygonEquals

private class PolygonState(
  var current: RNPolygon,
) {
  var polygon: Polygon? = null
}

class MapPolygonManager(
  private val builder: MapPolygonBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, PolygonState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.polygon == null }.forEach { addToMap(it) }
    }

  fun add(polygon: RNPolygon) =
    onUi {
      if (destroyed) return@onUi
      remove(polygon.id)
      val state = PolygonState(polygon)
      states[polygon.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNPolygon) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      val prev = state.current
      if (prev.polygonEquals(next)) return@onUi
      state.current = next
      state.polygon?.let { builder.update(prev, next, it) }
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

  private fun addToMap(state: PolygonState) {
    state.polygon =
      map?.addPolygon(builder.build(state.current))?.apply {
        tag = PolygonTag(id = state.current.id)
      }
  }

  private fun removeFromMap(state: PolygonState) {
    state.polygon?.remove()
  }
}
