package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.MarkerIconHitbox
import com.rngooglemapsplus.MarkerTag
import com.rngooglemapsplus.RNMarker

fun RNMarker.toMarkerTag(markerIconHitbox: MarkerIconHitbox?): MarkerTag =
  MarkerTag(
    id = id,
    iconSvg = infoWindowIconSvg,
    markerIconHitbox = markerIconHitbox,
    markerAnchorX = anchor?.x ?: 0.5,
    markerAnchorY = anchor?.y ?: 1.0,
  )
