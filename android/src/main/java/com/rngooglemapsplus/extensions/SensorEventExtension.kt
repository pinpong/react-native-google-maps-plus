package com.rngooglemapsplus.extensions

import android.hardware.SensorEvent
import android.hardware.SensorManager
import com.rngooglemapsplus.RNHeading

// Rotation vector events only. The azimuth is relative to magnetic north,
// the declination turns it into true north.
fun SensorEvent.toRNHeading(declination: Double): RNHeading {
  val rotationMatrix = FloatArray(9)
  val orientation = FloatArray(3)
  SensorManager.getRotationMatrixFromVector(rotationMatrix, values)
  SensorManager.getOrientation(rotationMatrix, orientation)
  val heading = (Math.toDegrees(orientation[0].toDouble()) + declination).normalizeDegrees()
  // values[4] is the estimated heading accuracy in radians, -1 when unavailable.
  val accuracy =
    if (values.size > 4 && values[4] >= 0f) {
      Math.toDegrees(values[4].toDouble())
    } else {
      -1.0
    }
  return RNHeading(heading, accuracy, System.currentTimeMillis().toDouble())
}
