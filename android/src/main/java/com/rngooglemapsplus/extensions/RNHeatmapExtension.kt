package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNHeatmap

fun RNHeatmap.heatmapEquals(b: RNHeatmap): Boolean {
  if (pressable != b.pressable) return false
  if (zIndex != b.zIndex) return false
  if (radius != b.radius) return false
  if (opacity != b.opacity) return false
  if (!weightedData.contentEquals(b.weightedData)) return false
  if (gradient != b.gradient) return false
  return true
}

fun RNHeatmap.heatmapNeedsRebuild(b: RNHeatmap): Boolean {
  if (radius != null && b.radius == null) return true
  if (opacity != null && b.opacity == null) return true
  if (gradient != null && b.gradient == null) return true
  return false
}
