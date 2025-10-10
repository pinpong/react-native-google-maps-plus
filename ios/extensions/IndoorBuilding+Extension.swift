import GoogleMaps
import NitroModules

extension GMSIndoorLevel {
  func toRNIndoorLevel(index: Int, active: Bool) -> RNIndoorLevel {
    RNIndoorLevel(
      index: Double(index),
      name: self.name,
      shortName: self.shortName,
      active: active
    )
  }
}

extension GMSIndoorBuilding {
  func toRNIndoorBuilding(from indoorDisplay: GMSIndoorDisplay)
  -> RNIndoorBuilding {
    let activeLevel = indoorDisplay.activeLevel
    let levels = self.levels.enumerated().map {
      (index, level) -> RNIndoorLevel in
      let isActive = (level == activeLevel)
      return level.toRNIndoorLevel(index: index, active: isActive)
    }
    let activeIndex = self.levels.firstIndex(where: { $0 == activeLevel })

    return RNIndoorBuilding(
      activeLevelIndex: activeIndex.map { Double($0) } ?? nil,
      defaultLevelIndex: nil,
      levels: levels,
      underground: self.isUnderground
    )
  }
}
