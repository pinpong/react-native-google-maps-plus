package com.rngooglemapsplus

import android.graphics.Color
import androidx.core.graphics.toColorInt

fun String.toColor(default: Int = Color.TRANSPARENT): Int =
  try {
    parseCssColor(this)
  } catch (_: Throwable) {
    default
  }

private fun parseCssColor(input: String): Int {
  val s = input.trim()
  return when {
    s.startsWith("#") -> normalizeHexColor(s).toColorInt()
    s.startsWith("rgba", ignoreCase = true) -> parseRgba(s)
    s.startsWith("rgb", ignoreCase = true) -> parseRgb(s)
    else -> s.toColorInt()
  }
}

private fun normalizeHexColor(hex: String): String {
  val h = hex.removePrefix("#")
  return when (h.length) {
    3 ->
      "#FF" +
        h
          .map { "$it$it" }
          .joinToString("")

    4 -> "#" + h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
    6 -> "#FF$h"
    8 -> "#$h"
    else -> "#$h"
  }
}

private fun parseRgb(s: String): Int {
  val nums =
    s
      .substringAfter("(")
      .substringBefore(")")
      .split(",")
      .map { it.trim().toInt() }
  require(nums.size == 3) { "Invalid rgb(): $s" }
  val (r, g, b) = nums
  return Color.argb(255, r, g, b)
}

private fun parseRgba(s: String): Int {
  val array =
    s
      .substringAfter("(")
      .substringBefore(")")
      .split(",")
      .map { it.trim() }
  require(array.size == 4) { "Invalid rgba(): $s" }
  val r = array[0].toInt()
  val g = array[1].toInt()
  val b = array[2].toInt()
  val aFloat = array[3].toFloat()
  val a = (aFloat.coerceIn(0f, 1f) * 255f + 0.5f).toInt()
  return Color.argb(a, r, g, b)
}
