package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.StreetViewSource
import com.rngooglemapsplus.RNStreetViewSource

fun RNStreetViewSource?.toStreetViewSource(): StreetViewSource =
  when (this) {
    RNStreetViewSource.OUTDOOR -> StreetViewSource.OUTDOOR
    RNStreetViewSource.DEFAULT -> StreetViewSource.DEFAULT
    null -> StreetViewSource.DEFAULT
  }
