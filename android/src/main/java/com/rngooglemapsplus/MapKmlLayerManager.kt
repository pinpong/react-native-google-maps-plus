package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.maps.android.data.renderer.mapview.MapViewRenderer
import com.rngooglemapsplus.extensions.kmlLayerEquals
import kotlinx.coroutines.Job

private class KmlLayerState(
  val current: RNKMLayer,
) {
  var renderer: MapViewRenderer? = null
  var parseJob: Job? = null
}

class MapKmlLayerManager(
  private val builder: MapKmlLayerBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, KmlLayerState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.renderer == null && it.parseJob == null }.forEach { addToMap(it) }
    }

  fun add(kmlLayer: RNKMLayer) =
    onUi {
      if (destroyed) return@onUi
      remove(kmlLayer.id)
      val state = KmlLayerState(kmlLayer)
      states[kmlLayer.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNKMLayer) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      if (state.current.kmlLayerEquals(next)) return@onUi
      add(next)
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

  private fun addToMap(state: KmlLayerState) {
    val map = map ?: return
    state.parseJob =
      builder.parse(state.current) { layer ->
        state.parseJob = null
        if (states[state.current.id] !== state) return@parse
        state.renderer = builder.build(map, layer)
      }
  }

  private fun removeFromMap(state: KmlLayerState) {
    state.parseJob?.cancel()
    state.parseJob = null
    state.renderer?.clear()
    state.renderer = null
  }
}
