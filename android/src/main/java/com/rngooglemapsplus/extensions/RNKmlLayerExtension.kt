package com.rngooglemapsplus.extensions

import com.rngooglemapsplus.RNKmlLayer

fun RNKmlLayer.kmlLayerEquals(b: RNKmlLayer): Boolean {
  if (kmlString != b.kmlString) return false
  return true
}
