package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.TileOverlay
import com.rngooglemapsplus.extensions.urlTileOverlayEquals

private class UrlTileOverlayState(
  var current: RNUrlTileOverlay,
) {
  var overlay: TileOverlay? = null
}

class MapUrlTileOverlayManager(
  private val builder: MapUrlTileOverlayBuilder,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, UrlTileOverlayState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.overlay == null }.forEach { addToMap(it) }
    }

  fun add(urlTileOverlay: RNUrlTileOverlay) =
    onUi {
      if (destroyed) return@onUi
      states.remove(urlTileOverlay.id)?.let { removeFromMap(it) }
      val state = UrlTileOverlayState(urlTileOverlay)
      states[urlTileOverlay.id] = state
      if (map != null) addToMap(state)
    }

  fun update(next: RNUrlTileOverlay) =
    onUi {
      if (destroyed) return@onUi
      val state = states[next.id] ?: return@onUi
      val prev = state.current
      if (prev.urlTileOverlayEquals(next)) return@onUi
      state.current = next
      val overlay = state.overlay ?: return@onUi
      if (prev.url != next.url || prev.tileSize != next.tileSize) {
        removeFromMap(state)
        addToMap(state)
      } else {
        builder.update(prev, next, overlay)
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

  private fun addToMap(state: UrlTileOverlayState) {
    state.overlay = map?.addTileOverlay(builder.build(state.current))
  }

  private fun removeFromMap(state: UrlTileOverlayState) {
    state.overlay?.let {
      it.clearTileCache()
      it.remove()
    }
  }
}
