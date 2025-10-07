package com.rngooglemapsplus

import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.google.android.gms.maps.model.PolygonOptions
import com.rngooglemapsplus.extensions.toColor

class MapPolygonBuilder {
  fun buildPolygonOptions(poly: RNPolygon): PolygonOptions =
    PolygonOptions().apply {
      poly.coordinates.forEach { pt ->
        add(
          com.google.android.gms.maps.model
            .LatLng(pt.latitude, pt.longitude),
        )
      }
      poly.fillColor?.let { fillColor(it.toColor()) }
      poly.strokeColor?.let { strokeColor(it.toColor()) }
      poly.strokeWidth?.let { strokeWidth(it.dpToPx()) }
      poly.pressable?.let { clickable(it) }
      poly.zIndex?.let { zIndex(it.toFloat()) }
    }
}
