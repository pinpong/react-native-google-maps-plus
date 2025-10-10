package com.rngooglemapsplus.extensions

import android.graphics.Bitmap
import com.rngooglemapsplus.RNSnapshotFormat

fun RNSnapshotFormat?.toCompressFormat(): Bitmap.CompressFormat =
  when (this) {
    RNSnapshotFormat.JPG, RNSnapshotFormat.JPEG -> Bitmap.CompressFormat.JPEG
    RNSnapshotFormat.PNG, null -> Bitmap.CompressFormat.PNG
  }

fun RNSnapshotFormat?.toFileExtension(): String =
  when (this) {
    RNSnapshotFormat.JPG, RNSnapshotFormat.JPEG -> "jpg"
    RNSnapshotFormat.PNG, null -> "png"
  }
