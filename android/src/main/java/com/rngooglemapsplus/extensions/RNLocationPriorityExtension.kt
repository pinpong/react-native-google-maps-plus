package com.rngooglemapsplus.extensions

import com.google.android.gms.location.Priority
import com.rngooglemapsplus.RNAndroidLocationPriority

fun RNAndroidLocationPriority.toGooglePriority(): Int =
  when (this) {
    RNAndroidLocationPriority.PRIORITY_HIGH_ACCURACY -> Priority.PRIORITY_HIGH_ACCURACY
    RNAndroidLocationPriority.PRIORITY_BALANCED_POWER_ACCURACY -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
    RNAndroidLocationPriority.PRIORITY_LOW_POWER -> Priority.PRIORITY_LOW_POWER
    RNAndroidLocationPriority.PRIORITY_PASSIVE -> Priority.PRIORITY_PASSIVE
  }
