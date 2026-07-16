package com.rngooglemapsplus

import MarkerTag
import android.widget.ImageView
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.Marker
import com.rngooglemapsplus.extensions.anchorEquals
import com.rngooglemapsplus.extensions.infoWindowAnchorEquals
import com.rngooglemapsplus.extensions.markerEquals
import com.rngooglemapsplus.extensions.styleHash
import kotlinx.coroutines.Job

private class MarkerState(
  var current: RNMarker,
) {
  var marker: Marker? = null
  var currentToken: Long = 0L
  var appliedIcon: BitmapDescriptor? = null
  var iconReady: Boolean = false
  var anchorsDeferred: Boolean = false
  var appliedStyleHash: Int? = null
  var renderingStyleHash: Int? = null
  var renderJob: Job? = null
}

class MapMarkerManager(
  private val markerBuilder: MapMarkerBuilder,
) {
  private var map: GoogleMap? = null
  private val markerStates = mutableMapOf<String, MarkerState>()
  private var iconGeneration = 0L
  private var destroyed = false

  fun attachMap(map: GoogleMap) =
    onUi {
      if (destroyed) return@onUi
      this.map = map
      markerStates.values
        .filter { it.marker == null && it.iconReady && it.renderJob == null }
        .forEach { addToMap(it) }
    }

  fun add(marker: RNMarker) =
    onUi {
      if (destroyed) return@onUi
      markerStates.remove(marker.id)?.let { removeFromMap(it) }
      val state = MarkerState(marker)
      markerStates[marker.id] = state
      requestIcon(state)
    }

  fun update(next: RNMarker) =
    onUi {
      if (destroyed) return@onUi
      val state = markerStates[next.id] ?: return@onUi
      val prev = state.current
      if (prev.markerEquals(next)) return@onUi
      state.current = next

      val nextStyleHash = if (next.iconSvg != null) next.styleHash() else null
      val renderingSameStyle = state.renderJob != null && state.renderingStyleHash == nextStyleHash
      val iconUpToDate = state.renderJob == null && state.iconReady && state.appliedStyleHash == nextStyleHash
      val needsRender = !renderingSameStyle && !iconUpToDate
      val deferAnchors = needsRender || state.renderJob != null
      if (deferAnchors && (!prev.anchorEquals(next) || !prev.infoWindowAnchorEquals(next))) {
        state.anchorsDeferred = true
      }

      state.marker?.let { marker ->
        markerBuilder.update(prev, next, marker, deferAnchors)
        if (marker.isInfoWindowShown) {
          marker.hideInfoWindow()
          marker.showInfoWindow()
        }
      }

      if (needsRender) requestIcon(state)
    }

  fun remove(id: String) =
    onUi {
      markerStates.remove(id)?.let { removeFromMap(it) }
    }

  fun showInfoWindow(id: String) =
    onUi {
      markerStates[id]?.marker?.showInfoWindow()
    }

  fun hideInfoWindow(id: String) =
    onUi {
      markerStates[id]?.marker?.hideInfoWindow()
    }

  fun infoWindowView(markerTag: MarkerTag): ImageView? = markerBuilder.buildInfoWindow(markerTag)

  fun clearIconCache() = markerBuilder.clearIconCache()

  fun cancelAllRenders() =
    onUi {
      markerStates.values.forEach { state ->
        if (state.marker == null) return@forEach
        state.renderJob?.cancel()
        state.renderJob = null
        state.renderingStyleHash = null
      }
    }

  fun destroy() =
    onUi {
      destroyed = true
      markerStates.values.forEach { removeFromMap(it) }
      markerStates.clear()
      markerBuilder.clearIconCache()
      map = null
    }

  private fun requestIcon(state: MarkerState) {
    state.renderJob?.cancel()
    state.renderJob = null
    iconGeneration += 1
    val token = iconGeneration
    state.currentToken = token
    val id = state.current.id

    val iconSvg = state.current.iconSvg
    if (iconSvg == null) {
      state.renderingStyleHash = null
      applyIcon(id, token, null)
      return
    }

    val styleHash = state.current.styleHash()
    markerBuilder.cachedIcon(styleHash)?.let { cached ->
      state.renderingStyleHash = null
      applyIcon(id, token, cached)
      return
    }

    state.renderingStyleHash = styleHash
    state.renderJob =
      markerBuilder.renderIcon(id, iconSvg, styleHash) { icon ->
        applyIcon(id, token, icon)
      }
  }

  private fun applyIcon(
    id: String,
    token: Long,
    icon: BitmapDescriptor?,
  ) {
    val state = markerStates[id] ?: return
    if (state.currentToken != token) return
    state.renderJob = null
    state.renderingStyleHash = null
    state.appliedStyleHash = if (state.current.iconSvg != null) state.current.styleHash() else null
    state.iconReady = true

    val marker = state.marker
    if (marker != null) {
      marker.setIcon(icon)
      if (state.anchorsDeferred) {
        markerBuilder.applyAnchors(state.current, marker)
        state.anchorsDeferred = false
      }
      return
    }

    state.appliedIcon = icon
    if (map != null) addToMap(state)
  }

  private fun addToMap(state: MarkerState) {
    val marker =
      map?.addMarker(markerBuilder.build(state.current, state.appliedIcon))?.apply {
        tag = MarkerTag(id = state.current.id, iconSvg = state.current.infoWindowIconSvg)
      }
    if (marker != null) {
      state.marker = marker
    }
    state.appliedIcon = null
    state.anchorsDeferred = false
  }

  private fun removeFromMap(state: MarkerState) {
    state.renderJob?.cancel()
    state.marker?.remove()
  }
}
