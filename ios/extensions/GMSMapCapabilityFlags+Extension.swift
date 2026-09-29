import GoogleMaps

extension GMSMapCapabilityFlags {
  func toRNMapCapabilities() -> RNMapCapabilities {
    return RNMapCapabilities(
      advancedMarkersAvailable: contains(.advancedMarkers),
      dataDrivenStylingAvailable: contains(.dataDrivenStyling)
    )
  }
}
