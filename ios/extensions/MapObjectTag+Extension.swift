import GoogleMaps
import Foundation

protocol MapObjectTag {
  var id: String { get }
}

struct MarkerTag: MapObjectTag {
  let id: String
  let iconSvg: RNMarkerSvg?
  init(id: String, iconSvg: RNMarkerSvg? = nil) {
    self.id = id
    self.iconSvg = iconSvg
  }
}

struct PolylineTag: MapObjectTag { let id: String }
struct PolygonTag: MapObjectTag { let id: String }
struct CircleTag: MapObjectTag { let id: String }

extension GMSMarker {
  var tagData: MarkerTag {
    get {
      if let tag = userData as? MarkerTag {
        return tag
      } else {
        print("[MapTag] Marker without tag detected at \(position)")
        let fallback = MarkerTag(id: "unknown")
        userData = fallback
        return fallback
      }
    }
    set {
      userData = newValue
    }
  }

  var idTag: String { tagData.id }
}

extension GMSPolyline {
  var tagData: PolylineTag {
    get {
      if let tag = userData as? PolylineTag {
        return tag
      } else {
        print("[MapTag] Polyline without tag detected")
        let fallback = PolylineTag(id: "unknown")
        userData = fallback
        return fallback
      }
    }
    set { userData = newValue }
  }

  var idTag: String { tagData.id }
}

extension GMSPolygon {
  var tagData: PolygonTag {
    get {
      if let tag = userData as? PolygonTag {
        return tag
      } else {
        print("[MapTag] Polygon without tag detected")
        let fallback = PolygonTag(id: "unknown")
        userData = fallback
        return fallback
      }
    }
    set { userData = newValue }
  }

  var idTag: String { tagData.id }
}

extension GMSCircle {
  var tagData: CircleTag {
    get {
      if let tag = userData as? CircleTag {
        return tag
      } else {
        print("[MapTag] Circle without tag detected")
        let fallback = CircleTag(id: "unknown")
        userData = fallback
        return fallback
      }
    }
    set { userData = newValue }
  }

  var idTag: String { tagData.id }
}
