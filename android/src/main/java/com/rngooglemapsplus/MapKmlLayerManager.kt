package com.rngooglemapsplus

import android.content.Context
import com.google.android.gms.maps.GoogleMap
import com.google.maps.android.data.kml.KmlLayer
import com.rngooglemapsplus.extensions.kmlLayerEquals
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

private class KmlLayerState(
  val current: RNKMLayer,
) {
  var layer: KmlLayer? = null
}

class MapKmlLayerManager(
  private val context: Context,
  private val mapErrorHandler: MapErrorHandler,
) {
  private var map: GoogleMap? = null
  private val states = mutableMapOf<String, KmlLayerState>()
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      states.values.filter { it.layer == null }.forEach { addToMap(it) }
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
    try {
      val inputStream = ByteArrayInputStream(state.current.kmlString.toByteArray(StandardCharsets.UTF_8))
      val layer = KmlLayer(map, inputStream, context)
      state.layer = layer
      layer.addLayerToMap()
    } catch (e: Exception) {
      mapErrorHandler.report(RNMapErrorCode.KML_LAYER_FAILED, "kmlLayerId=${state.current.id} parse failed", e)
    }
  }

  private fun removeFromMap(state: KmlLayerState) {
    state.layer?.removeLayerFromMap()
  }
}
