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
  if (!advancedMarkerEquals(b)) return false

  return true
}

fun RNMarker.advancedMarkerEquals(b: RNMarker): Boolean {
  if ((advancedOptions != null) != (b.advancedOptions != null)) return false
  if (advancedOptions?.collisionBehavior != b.advancedOptions?.collisionBehavior) return false

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

fun RNMarker.infoWindowContentEquals(b: RNMarker): Boolean {
  val hasInfoWindowIcon = infoWindowIconSvg != null
  if (hasInfoWindowIcon != (b.infoWindowIconSvg != null)) return false
  if (hasInfoWindowIcon) return markerInfoWindowStyleEquals(b)
  if (title != b.title) return false
  if (snippet != b.snippet) return false

  return true
}

fun RNMarker.infoWindowIsEmpty(): Boolean = infoWindowIconSvg == null && title == null && snippet == null

fun RNMarker.markerStyleEquals(b: RNMarker): Boolean {
  if (iconSvg?.width != b.iconSvg?.width) return false
  if (iconSvg?.height != b.iconSvg?.height) return false
  if (iconSvg?.svgString != b.iconSvg?.svgString) return false
  if (!markerPinConfigEquals(b)) return false

  return true
}

fun RNMarker.markerPinConfigEquals(b: RNMarker): Boolean {
  val pinConfig = advancedOptions?.pinConfig
  val bPinConfig = b.advancedOptions?.pinConfig
  if ((pinConfig != null) != (bPinConfig != null)) return false
  if (pinConfig?.backgroundColor != bPinConfig?.backgroundColor) return false
  if (pinConfig?.borderColor != bPinConfig?.borderColor) return false
  if (pinConfig?.glyph?.iconSvg?.width != bPinConfig?.glyph?.iconSvg?.width) return false
  if (pinConfig?.glyph?.iconSvg?.height != bPinConfig?.glyph?.iconSvg?.height) return false
  if (pinConfig?.glyph?.iconSvg?.svgString != bPinConfig?.glyph?.iconSvg?.svgString) return false
  if (pinConfig?.glyph?.text != bPinConfig?.glyph?.text) return false
  if (pinConfig?.glyph?.textColor != bPinConfig?.glyph?.textColor) return false
  if (pinConfig?.glyph?.color != bPinConfig?.glyph?.color) return false

  return true
}

fun RNMarker.styleHash(): Int {
  val pinConfig = advancedOptions?.pinConfig
  return arrayOf<Any?>(
    iconSvg?.width,
    iconSvg?.height,
    iconSvg?.svgString,
    pinConfig != null,
    pinConfig?.backgroundColor,
    pinConfig?.borderColor,
    pinConfig?.glyph?.iconSvg?.width,
    pinConfig?.glyph?.iconSvg?.height,
    pinConfig?.glyph?.iconSvg?.svgString,
    pinConfig?.glyph?.text,
    pinConfig?.glyph?.textColor,
    pinConfig?.glyph?.color,
  ).contentHashCode()
}
