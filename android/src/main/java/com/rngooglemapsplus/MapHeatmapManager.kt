package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.TileOverlay
import com.google.maps.android.heatmaps.HeatmapTileProvider
import com.rngooglemapsplus.extensions.heatmapEquals
import com.rngooglemapsplus.extensions.heatmapNeedsRebuild

private class HeatmapState(
  var current: RNHeatmap,
) {
  var provider: HeatmapTileProvider? = null
  var overlay: TileOverlay? = null
}

class MapHeatmapManager(
  private val builder: MapHeatmapBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, HeatmapState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.overlay == null }.forEach { addToMap(it) }
    }

  fun add(heatmap: RNHeatmap) =
    onUi {
      if (destroyed) return@onUi
      states.remove(heatmap.id)?.let { removeFromMap(it) }
      val state = HeatmapState(heatmap)
      states[heatmap.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNHeatmap) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      val prev = state.current
      if (prev.heatmapEquals(next)) return@onUi
      state.current = next
      val provider = state.provider ?: return@onUi
      val overlay = state.overlay ?: return@onUi
      if (prev.heatmapNeedsRebuild(next)) {
        removeFromMap(state)
        addToMap(state)
      } else {
        builder.update(prev, next, provider, overlay)
      }
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

  private fun addToMap(state: HeatmapState) {
    val provider = builder.buildProvider(state.current)
    state.provider = provider
    state.overlay = map?.addTileOverlay(builder.build(state.current, provider))
  }

  private fun removeFromMap(state: HeatmapState) {
    state.overlay?.let {
      it.clearTileCache()
      it.remove()
    }
  }
}
