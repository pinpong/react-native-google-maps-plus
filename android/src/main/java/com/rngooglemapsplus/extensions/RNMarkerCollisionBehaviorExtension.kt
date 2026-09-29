package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.AdvancedMarkerOptions.CollisionBehavior
import com.rngooglemapsplus.RNMarkerCollisionBehavior

fun RNMarkerCollisionBehavior.toGoogleCollisionBehavior(): Int =
  when (this) {
    RNMarkerCollisionBehavior.REQUIRED -> CollisionBehavior.REQUIRED
    RNMarkerCollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL -> CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
    RNMarkerCollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY -> CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY
  }
