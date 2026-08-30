package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.AdvancedMarkerOptions
import com.rngooglemapsplus.RNMarkerCollisionBehavior

fun RNMarkerCollisionBehavior.toGoogleCollisionBehavior(): Int =
  when (this) {
    RNMarkerCollisionBehavior.REQUIRED -> {
      AdvancedMarkerOptions.CollisionBehavior.REQUIRED
    }

    RNMarkerCollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL -> {
      AdvancedMarkerOptions.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
    }

    RNMarkerCollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY -> {
      AdvancedMarkerOptions.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY
    }
  }
