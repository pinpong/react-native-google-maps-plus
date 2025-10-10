package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNSnapshotResultType

fun RNSnapshotResultType?.isFileResult(): Boolean =
  when (this) {
    RNSnapshotResultType.FILE -> true
    RNSnapshotResultType.BASE64, null -> false
  }
