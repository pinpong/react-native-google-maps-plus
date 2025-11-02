import CoreLocation
import GoogleMaps

extension RNCameraUpdate {
  func toGMSCameraPosition(current: GMSCameraPosition?) -> GMSCameraPosition {
    let center = CLLocationCoordinate2D(
      latitude: center?.latitude ?? current?.target.latitude ?? 0.0,
      longitude: center?.longitude ?? current?.target.longitude ?? 0.0
    )

    let zoom = Float(zoom ?? Double(current?.zoom ?? 0))
    let bearing = bearing ?? current?.bearing ?? 0
    let tilt = tilt ?? current?.viewingAngle ?? 0

    return GMSCameraPosition.camera(
      withTarget: center,
      zoom: zoom,
      bearing: bearing,
      viewingAngle: tilt
    )
  }
}
