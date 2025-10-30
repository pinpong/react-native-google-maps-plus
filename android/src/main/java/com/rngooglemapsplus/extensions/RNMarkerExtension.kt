package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNMarker

fun RNMarker.markerEquals(b: RNMarker): Boolean {
  if (id != b.id) return false
  if (zIndex != b.zIndex) return false
  if (!coordinatesEquals(b)) return false
  if (!anchorEquals(b)) return false
  if (!infoWindowAnchorEquals(b)) return false
  if (title != b.title) return false
  if (snippet != b.snippet) return false
  if (opacity != b.opacity) return false
  if (flat != b.flat) return false
  if (draggable != b.draggable) return false
  if (rotation != b.rotation) return false
  if (!markerInfoWindowStyleEquals(b)) return false
  if (!markerStyleEquals(b)) return false

  return true
}

fun RNMarker.coordinatesEquals(b: RNMarker): Boolean {
  if (coordinate.latitude != b.coordinate.latitude) return false
  if (coordinate.longitude != b.coordinate.longitude) return false
  return true
}

fun RNMarker.anchorEquals(b: RNMarker): Boolean {
  if (anchor?.x != b.anchor?.x) return false
  if (anchor?.y != b.anchor?.y) return false
  return true
}

fun RNMarker.infoWindowAnchorEquals(b: RNMarker): Boolean {
  if (infoWindowAnchor?.x != b.infoWindowAnchor?.x) return false
  if (infoWindowAnchor?.y != b.infoWindowAnchor?.y) return false
  return true
}

fun RNMarker.markerInfoWindowStyleEquals(b: RNMarker): Boolean {
  if (infoWindowIconSvg?.width != b.infoWindowIconSvg?.width) return false
  if (infoWindowIconSvg?.height != b.infoWindowIconSvg?.height) return false
  if (infoWindowIconSvg?.svgString != b.infoWindowIconSvg?.svgString) return false

  return true
}

fun RNMarker.markerStyleEquals(b: RNMarker): Boolean {
  if (iconSvg?.width != b.iconSvg?.width) return false
  if (iconSvg?.height != b.iconSvg?.height) return false
  if (iconSvg?.svgString != b.iconSvg?.svgString) return false

  return true
}

fun RNMarker.styleHash(): Int =
  arrayOf<Any?>(
    iconSvg?.width,
    iconSvg?.height,
    iconSvg?.svgString,
  ).contentHashCode()
