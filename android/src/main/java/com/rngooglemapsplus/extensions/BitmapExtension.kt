package com.rngooglemapsplus.extensions

import android.content.Context
import android.graphics.Bitmap
import android.util.Base64
import android.util.Size
import androidx.core.graphics.scale
import com.rngooglemapsplus.MapErrorHandler
import com.rngooglemapsplus.RNMapErrorCode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream

fun Bitmap.encode(
  context: Context,
  targetSize: Size?,
  format: String,
  compressFormat: Bitmap.CompressFormat,
  quality: Double,
  asFile: Boolean,
  mapErrorHandler: MapErrorHandler,
): String? =
  try {
    targetSize?.let { scale(it.width, it.height) }
    val output = ByteArrayOutputStream()
    compress(compressFormat, (quality * 100).toInt().coerceIn(0, 100), output)
    val bytes = output.toByteArray()

    if (asFile) {
      val file = File(context.cacheDir, "snapshot_${System.currentTimeMillis()}.$format")
      FileOutputStream(file).use { it.write(bytes) }
      file.absolutePath
    } else {
      "data:image/$format;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
    }
  } catch (e: Exception) {
    mapErrorHandler.report(RNMapErrorCode.SNAPSHOT_EXPORT_FAILED, "snapshot export failed", e)
    null
  }
