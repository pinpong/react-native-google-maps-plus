package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNMapPadding

fun RNMapPadding?.combinedWith(b: RNMapPadding) =
  RNMapPadding(
    top = (this?.top ?: 0.0) + b.top,
    left = (this?.left ?: 0.0) + b.left,
    bottom = (this?.bottom ?: 0.0) + b.bottom,
    right = (this?.right ?: 0.0) + b.right,
  )
