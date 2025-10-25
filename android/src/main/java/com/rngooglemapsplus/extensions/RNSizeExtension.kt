package com.rngooglemapsplus.extensions

import android.util.Size
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.rngooglemapsplus.RNSize

fun RNSize?.toSize(): Size? = this?.let { Size(width.dpToPx().toInt(), height.dpToPx().toInt()) }
