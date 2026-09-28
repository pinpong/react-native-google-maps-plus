package com.rngooglemapsplus.extensions

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.ByteArrayOutputStream

fun ByteArray.toPng(): ByteArray? {
  val bitmap = BitmapFactory.decodeByteArray(this, 0, size) ?: return null
  return try {
    ByteArrayOutputStream().use { output ->
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)
      output.toByteArray()
    }
  } finally {
    bitmap.recycle()
  }
}
