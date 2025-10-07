package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNMarker

fun RNMarker.markerEquals(b: RNMarker): Boolean =
  id == b.id &&
    zIndex == b.zIndex &&
    coordinate == b.coordinate &&
    anchor == b.anchor &&
    markerStyleEquals(b)

fun RNMarker.markerStyleEquals(b: RNMarker): Boolean = iconSvg == b.iconSvg

fun RNMarker.styleHash(): Int =
  arrayOf<Any?>(
    iconSvg,
  ).contentHashCode()
