package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.MapColorScheme
import com.rngooglemapsplus.RNUserInterfaceStyle

fun RNUserInterfaceStyle?.toMapColorScheme(): Int? =
  when (this) {
    RNUserInterfaceStyle.LIGHT -> MapColorScheme.LIGHT
    RNUserInterfaceStyle.DARK -> MapColorScheme.DARK
    RNUserInterfaceStyle.SYSTEM -> MapColorScheme.FOLLOW_SYSTEM
    null -> null
  }
