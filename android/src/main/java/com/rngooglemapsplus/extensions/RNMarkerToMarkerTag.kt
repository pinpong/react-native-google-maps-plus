package com.rngooglemapsplus.extensions

import MarkerTag
import com.rngooglemapsplus.RNMarker

fun RNMarker.toMarkerTag(): MarkerTag =
  MarkerTag(
    id = id,
    iconSvg = infoWindowIconSvg,
    markerIconWidth = iconSvg?.width,
    markerIconHeight = iconSvg?.height,
    markerAnchorX = anchor?.x ?: 0.5,
    markerAnchorY = anchor?.y ?: 1.0,
  )
