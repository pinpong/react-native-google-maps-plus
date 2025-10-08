package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.heatmaps.WeightedLatLng
import com.rngooglemapsplus.RNHeatmapPoint

fun RNHeatmapPoint.toWeightedLatLng(): WeightedLatLng = WeightedLatLng(LatLng(latitude, longitude), weight)

fun Array<RNHeatmapPoint>.toWeightedLatLngs(): Collection<WeightedLatLng> = map { it.toWeightedLatLng() }
