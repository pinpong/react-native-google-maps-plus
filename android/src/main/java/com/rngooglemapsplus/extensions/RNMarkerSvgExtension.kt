package com.rngooglemapsplus.extensions

import android.util.Size
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.rngooglemapsplus.RNMarkerSvg
import kotlin.math.ceil

fun RNMarkerSvg.toPixelSizeOrNull(): Size? {
  val width = ceil(width.dpToPx()).toInt()
  val height = ceil(height.dpToPx()).toInt()
  if (width < 1 || height < 1) return null
  return Size(width, height)
}
