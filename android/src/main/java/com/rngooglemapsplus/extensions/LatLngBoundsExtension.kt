package com.rngooglemapsplus.extensions

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.rngooglemapsplus.RNLatLngBounds
import com.rngooglemapsplus.RNMapPadding

fun LatLngBounds.toRnLatLngBounds(): RNLatLngBounds =
  RNLatLngBounds(
    northeast = northeast.toRnLatLng(),
    southwest = southwest.toRnLatLng(),
  )

fun LatLngBounds.withPaddingPixels(
  mapWidthPx: Int,
  mapHeightPx: Int,
  padding: RNMapPadding,
): LatLngBounds {
  val latSpan = northeast.latitude - southwest.latitude
  val lngSpan = northeast.longitude - southwest.longitude
  if (latSpan == 0.0 && lngSpan == 0.0) return this

  val latPerPixel = if (mapHeightPx != 0) latSpan / mapHeightPx else 0.0
  val lngPerPixel = if (mapWidthPx != 0) lngSpan / mapWidthPx else 0.0

  val builder = LatLngBounds.builder()
  builder.include(
    LatLng(
      northeast.latitude + (padding.top.dpToPx() * latPerPixel),
      northeast.longitude + (padding.right.dpToPx() * lngPerPixel),
    ),
  )
  builder.include(
    LatLng(
      southwest.latitude - (padding.bottom.dpToPx() * latPerPixel),
      southwest.longitude - (padding.left.dpToPx() * lngPerPixel),
    ),
  )
  return builder.build()
}
