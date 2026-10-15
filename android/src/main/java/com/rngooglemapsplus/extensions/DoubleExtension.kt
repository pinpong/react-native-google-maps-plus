package com.rngooglemapsplus.extensions

import kotlin.math.abs
import kotlin.math.min

fun Double.normalizeDegrees(): Double = ((this % 360) + 360) % 360

fun Double.angularDistanceTo(other: Double): Double {
  val difference = abs(this - other) % 360
  return min(difference, 360 - difference)
}
