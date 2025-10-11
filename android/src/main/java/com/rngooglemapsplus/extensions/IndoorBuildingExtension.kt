package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.IndoorBuilding
import com.google.android.gms.maps.model.IndoorLevel
import com.rngooglemapsplus.RNIndoorBuilding
import com.rngooglemapsplus.RNIndoorLevel

fun IndoorBuilding.toRNIndoorBuilding(): RNIndoorBuilding {
  val mappedLevels =
    levels
      .mapIndexed { index, level ->
        val active = index == activeLevelIndex
        level.toRNIndoorLevel(index, active)
      }.toTypedArray()

  return RNIndoorBuilding(
    activeLevelIndex = activeLevelIndex.toDouble(),
    defaultLevelIndex = defaultLevelIndex.toDouble(),
    levels = mappedLevels,
    underground = isUnderground,
  )
}

fun IndoorLevel.toRNIndoorLevel(
  index: Int,
  active: Boolean,
): RNIndoorLevel =
  RNIndoorLevel(
    index = index.toDouble(),
    name = name,
    shortName = shortName,
    active = active,
  )
