package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.ButtCap
import com.google.android.gms.maps.model.Cap
import com.google.android.gms.maps.model.RoundCap
import com.google.android.gms.maps.model.SquareCap
import com.rngooglemapsplus.RNLineCapType

fun RNLineCapType?.toMapLineCap(): Cap =
  when (this) {
    RNLineCapType.ROUND -> RoundCap()
    RNLineCapType.SQUARE -> SquareCap()
    else -> ButtCap()
  }
