import android.util.Log
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.Polygon
import com.google.android.gms.maps.model.Polyline
import com.rngooglemapsplus.RNMarkerSvg

sealed class MapObjectTag(
  open val id: String,
)

data class MarkerTag(
  override val id: String,
  val iconSvg: RNMarkerSvg? = null,
) : MapObjectTag(id)

data class PolylineTag(
  override val id: String,
) : MapObjectTag(id)

data class PolygonTag(
  override val id: String,
) : MapObjectTag(id)

data class CircleTag(
  override val id: String,
) : MapObjectTag(id)

val Marker.tagData: MarkerTag
  get() =
    (tag as? MarkerTag) ?: run {
      Log.w("MapTag", "Marker without tag detected at $position")
      val fallback = MarkerTag(id = "unknown")
      tag = fallback
      fallback
    }

val Marker.idTag: String
  get() = tagData.id

var Polyline.tagData: PolylineTag
  get() =
    (tag as? PolylineTag) ?: run {
      Log.w("MapTag", "Polyline without tag detected")
      val fallback = PolylineTag(id = "unknown")
      tag = fallback
      fallback
    }
  set(value) {
    tag = value
  }

val Polyline.idTag: String
  get() = tagData.id

var Polygon.tagData: PolygonTag
  get() =
    (tag as? PolygonTag) ?: run {
      Log.w("MapTag", "Polygon without tag detected")
      val fallback = PolygonTag(id = "unknown")
      tag = fallback
      fallback
    }
  set(value) {
    tag = value
  }

val Polygon.idTag: String
  get() = tagData.id

var Circle.tagData: CircleTag
  get() =
    (tag as? CircleTag) ?: run {
      Log.w("MapTag", "Circle without tag detected")
      val fallback = CircleTag(id = "unknown")
      tag = fallback
      fallback
    }
  set(value) {
    tag = value
  }

val Circle.idTag: String
  get() = tagData.id
