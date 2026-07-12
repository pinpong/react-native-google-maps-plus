package com.rngooglemapsplus

import com.google.android.gms.maps.model.BitmapDescriptor

internal data class PendingMarker(
  val marker: RNMarker,
  val icon: BitmapDescriptor?,
)
