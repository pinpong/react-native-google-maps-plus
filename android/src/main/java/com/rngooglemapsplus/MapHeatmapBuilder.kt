package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.maps.android.heatmaps.Gradient
import com.google.maps.android.heatmaps.HeatmapTileProvider
import com.rngooglemapsplus.extensions.toColor
import com.rngooglemapsplus.extensions.toWeightedLatLngs

class MapHeatmapBuilder {
  fun build(heatmap: RNHeatmap): TileOverlayOptions {
    val provider =
      HeatmapTileProvider
        .Builder()
        .apply {
          weightedData(heatmap.weightedData.toWeightedLatLngs())
          heatmap.radius?.let { radius(it.dpToPx().toInt().coerceIn(10, 50)) }
          heatmap.opacity?.let { opacity(it) }
          heatmap.gradient?.let {
            val colors = it.colors.map { c -> c.toColor() }.toIntArray()
            val startPoints = it.startPoints.map { p -> p.toFloat() }.toFloatArray()
            gradient(Gradient(colors, startPoints, it.colorMapSize.toInt()))
          }
        }.build()

    return TileOverlayOptions().apply {
      tileProvider(provider)
      heatmap.zIndex?.let { zIndex(it.toFloat()) }
    }
  }
}
