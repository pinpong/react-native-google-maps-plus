package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNKMLayer

fun RNKMLayer.kmlLayerEquals(b: RNKMLayer): Boolean {
  if (kmlString != b.kmlString) return false
  return true
}
