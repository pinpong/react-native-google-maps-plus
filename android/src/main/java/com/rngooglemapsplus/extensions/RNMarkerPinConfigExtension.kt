package com.rngooglemapsplus.extensions

import android.graphics.Color
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.PinConfig
import com.rngooglemapsplus.RNMarkerPinConfig
import com.rngooglemapsplus.RNMarkerPinGlyph

fun RNMarkerPinConfig.toPinConfig(glyphIcon: BitmapDescriptor?): PinConfig =
  PinConfig
    .builder()
    .apply {
      backgroundColor?.let { setBackgroundColor(it.toColor()) }
      borderColor?.let { setBorderColor(it.toColor()) }
      glyph?.toGlyph(glyphIcon)?.let { setGlyph(it) }
    }.build()

fun RNMarkerPinGlyph.toGlyph(icon: BitmapDescriptor?): PinConfig.Glyph? =
  icon?.let { PinConfig.Glyph(it) }
    ?: text?.let { PinConfig.Glyph(it, textColor?.toColor() ?: Color.BLACK) }
    ?: color?.let { PinConfig.Glyph(it.toColor()) }
