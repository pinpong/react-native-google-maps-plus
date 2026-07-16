package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.TileOverlay
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.maps.android.heatmaps.Gradient
import com.google.maps.android.heatmaps.HeatmapTileProvider
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toWeightedLatLngs

class MapHeatmapBuilder {
  fun buildProvider(heatmap: RNHeatmap): HeatmapTileProvider =
    HeatmapTileProvider
      .Builder()
      .apply {
        weightedData(heatmap.weightedData.toWeightedLatLngs())
        heatmap.radius?.let { radius(it.dpToPx().toInt().coerceIn(10, 50)) }
        heatmap.opacity?.let { opacity(it) }
        heatmap.gradient?.let { gradient(it.toGradient()) }
      }.build()

  fun build(
    heatmap: RNHeatmap,
    provider: HeatmapTileProvider,
  ): TileOverlayOptions =
    TileOverlayOptions().apply {
      tileProvider(provider)
      heatmap.zIndex?.let { zIndex(it.toFloat()) }
    }

  fun update(
    prev: RNHeatmap,
    next: RNHeatmap,
    provider: HeatmapTileProvider,
    overlay: TileOverlay,
  ) = onUi {
    var tilesDirty = false

    if (!prev.weightedData.contentEquals(next.weightedData)) {
      provider.setWeightedData(next.weightedData.toWeightedLatLngs())
      tilesDirty = true
    }

    if (prev.radius != next.radius) {
      next.radius?.let { provider.setRadius(it.dpToPx().toInt().coerceIn(10, 50)) }
      tilesDirty = true
    }

    if (prev.opacity != next.opacity) {
      next.opacity?.let { provider.setOpacity(it) }
      tilesDirty = true
    }

    if (prev.gradient != next.gradient) {
      next.gradient?.let { provider.setGradient(it.toGradient()) }
      tilesDirty = true
    }

    if (prev.zIndex != next.zIndex) {
      overlay.zIndex = next.zIndex?.toFloat() ?: 0f
    }

    if (tilesDirty) {
      overlay.clearTileCache()
    }
  }
}

private fun RNHeatmapGradient.toGradient(): Gradient =
  Gradient(
    colors.map { it.toColor() }.toIntArray(),
    startPoints.map { it.toFloat() }.toFloatArray(),
    colorMapSize.toInt(),
  )
