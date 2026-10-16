package com.rngooglemapsplus

import com.google.android.gms.maps.GoogleMap
import com.google.maps.android.data.parser.kml.KmlParser
import com.google.maps.android.data.renderer.UrlIconProvider
import com.google.maps.android.data.renderer.mapper.toLayer
import com.google.maps.android.data.renderer.mapview.MapViewRenderer
import com.google.maps.android.data.renderer.model.DataLayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import kotlin.coroutines.cancellation.CancellationException

class MapKmlLayerBuilder(
  private val mapErrorHandler: MapErrorHandler,
  private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
) {
  fun parse(
    kmlLayer: RNKMLayer,
    onReady: (DataLayer) -> Unit,
  ): Job =
    scope.launch {
      try {
        ensureActive()
        val inputStream = ByteArrayInputStream(kmlLayer.kmlString.toByteArray(StandardCharsets.UTF_8))
        val layer = KmlParser().parse(inputStream).toLayer()
        withContext(Dispatchers.Main) {
          ensureActive()
          onReady(layer)
        }
      } catch (_: CancellationException) {
        // cancelled
      } catch (t: Throwable) {
        mapErrorHandler.report(RNMapErrorCode.KML_LAYER_FAILED, "kmlLayerId=${kmlLayer.id} parse failed", t)
      }
    }

  fun build(
    map: GoogleMap,
    layer: DataLayer,
  ): MapViewRenderer = MapViewRenderer(map, UrlIconProvider()).apply { addLayer(layer) }
}
