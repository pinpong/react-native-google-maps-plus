import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RNAndroidLocationPriority, RNIOSLocationAccuracy } from '../../src';
import type {
  RNCamera,
  RNMapStyleElement,
  RNMarker,
  RNPolygon,
  RNPolyline,
  RNLocation,
  GoogleMapsViewRef,
  RNRegion,
  RNLatLng,
  RNCircle,
  RNHeatmap,
} from '../../src';
import { GoogleMapsView, GoogleMapsModule } from '../../src';
import { callback } from 'react-native-nitro-modules';

const standardMapStyle: RNMapStyleElement[] = [
  {
    featureType: 'poi.attraction',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.government',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.medical',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.place_of_worship',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.school',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.sports_complex',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

const silverMapStyle: RNMapStyleElement[] = [
  {
    featureType: 'poi.attraction',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.government',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.medical',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.place_of_worship',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.school',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.sports_complex',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ff0000',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#ff0000',
      },
    ],
  },
];

const kmlString = `
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Example KML Data</name>
    <description>Example with marker, polygon and circle shifted further northeast of San Francisco</description>

    <Placemark>
      <name>Center Point</name>
      <Point>
        <coordinates>-122.4156,37.7781,0</coordinates>
      </Point>
    </Placemark>

    <Placemark>
      <name>Example Polygon</name>
      <Style>
        <LineStyle>
          <color>ff0000ff</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>7d00ff00</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -122.4206,37.7826,0
              -122.4106,37.7826,0
              -122.4106,37.7746,0
              -122.4206,37.7746,0
              -122.4206,37.7826,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <Placemark>
      <name>Approximate Circle</name>
      <Style>
        <LineStyle>
          <color>ffff0000</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>3dff0000</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -122.4156,37.7801,0
              -122.4136,37.7801,0
              -122.4136,37.7761,0
              -122.4156,37.7761,0
              -122.4176,37.7761,0
              -122.4176,37.7801,0
              -122.4156,37.7801,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

  </Document>
</kml>
`.trim();

function makeSvgIcon(width: number, height: number): string {
  const color = randomColor();
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 88">
  <path
    d="M32 2c-14.36 0-26 11.64-26 26 0 18.2 20.67 38.86 24.82 43.02a1.7 1.7 0 0 0 2.36 0C37.33 66.86 58 46.2 58 28 58 13.64 46.36 2 32 2z"
    fill="${color}"
  />
  <circle cx="32" cy="28" r="10" fill="#FFFFFF" />
  <ellipse cx="32" cy="82" rx="14" ry="4" fill="#000000" opacity="0.15" />
</svg>
  `;
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const randomCoordinates = (
  baseLat: number,
  baseLng: number,
  offset = 0.01
) => ({
  latitude: baseLat + (Math.random() - 0.5) * offset,
  longitude: baseLng + (Math.random() - 0.5) * offset,
});

const randomWeightedCoordinates = (
  baseLat: number,
  baseLng: number,
  offset = 0.01
) => ({
  latitude: baseLat + (Math.random() - 0.5) * offset,
  longitude: baseLng + (Math.random() - 0.5) * offset,
  weight: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
});

const makePolygon = (id: number): RNPolygon => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  coordinates: [
    randomCoordinates(37.7749, -122.4194, 0.01),
    randomCoordinates(37.7749, -122.4194, 0.01),
    randomCoordinates(37.7749, -122.4194, 0.01),
    randomCoordinates(37.7749, -122.4194, 0.01),
  ],
  fillColor: '#0000ff',
  strokeColor: '#ff0000',
  strokeWidth: 1 + (id % 5),
});

const makePolyline = (id: number): RNPolyline => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  coordinates: [
    randomCoordinates(37.7749, -122.4194, 0.02),
    randomCoordinates(37.7749, -122.4194, 0.02),
    randomCoordinates(37.7749, -122.4194, 0.02),
  ],

  lineCap: id % 2 === 0 ? 'round' : 'square',
  lineJoin: id % 3 === 0 ? 'bevel' : 'round',
  color: id % 2 === 0 ? '#00ff00' : '#ff0000',
  width: 2 + (id % 4),
});

const makeCircle = (id: number): RNCircle => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  center: randomCoordinates(37.7749, -122.4194, 0.02),
  radius: 100 + (id % 5),
  strokeWidth: 1 + (id % 5),
  strokeColor: '#ff0000',
  fillColor: '#0000ff',
});

const makeHeatmap = (id: number): RNHeatmap => ({
  id: id.toString(),
  zIndex: id,
  weightedData: [
    randomWeightedCoordinates(37.7749, -122.4194, 0.02),
    randomWeightedCoordinates(37.7749, -122.4194, 0.03),
    randomWeightedCoordinates(37.7749, -122.4194, 0.05),
    randomWeightedCoordinates(37.7749, -122.4194, 0.01),
    randomWeightedCoordinates(37.7749, -122.4194, 0.08),
    randomWeightedCoordinates(37.7749, -122.4194, 0.03),
    randomWeightedCoordinates(37.7749, -122.4194, 0.09),
  ],
  gradient: {
    colors: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
    startPoints: [0.1, 0.3, 0.5, 0.7, 1],
    colorMapSize: 256,
  },
  radius: 100,
  opacity: 1,
});

export const makeMarker = (id: number): RNMarker => ({
  id: id.toString(),
  zIndex: id,
  coordinate: randomCoordinates(37.7749, -122.4194, 0.2),
  anchor: { x: 0.5, y: 1.0 },
  iconSvg:
    id % 2 === 0
      ? {
          width: (64 / 100) * 50,
          height: (88 / 100) * 50,
          svgString: makeSvgIcon(64, 88),
        }
      : undefined,
});

export default function App() {
  const mapRef = useRef<GoogleMapsViewRef>(null);
  const [stressTest, setStressTest] = useState(false);
  const [normalStyle, setNormalStyle] = useState(true);
  const [controlButtonsExpanded, setControlButtonsExpanded] = useState(false);

  const [initialProps] = useState({
    /// mapStyle not working with mapId
    /// mapId: '111',
    camera: {
      center: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      zoom: 15,
    },
  });

  const [uiSettings] = useState({
    allGesturesEnabled: true,
    compassEnabled: true,
    indoorLevelPickerEnabled: true,
    mapToolbarEnabled: true,
    myLocationButtonEnabled: true,
    rotateEnabled: true,
    scrollEnabled: true,
    scrollDuringRotateOrZoomEnabled: true,
    tiltEnabled: true,
    zoomControlsEnabled: true,
    zoomGesturesEnabled: true,
  });

  const [mapPadding] = useState({
    top: 20,
    left: 20,
    bottom: 20,
    right: 20,
  });

  const [mapZoomConfig] = useState({
    min: 0,
    max: 20,
  });

  const [locationConfig] = useState({
    android: {
      priority: RNAndroidLocationPriority.PRIORITY_BALANCED_POWER_ACCURACY,
      interval: 5000,
      minUpdateInterval: 5000,
    },
    ios: {
      desiredAccuracy: RNIOSLocationAccuracy.ACCURACY_BEST,
      distanceFilterMeters: 10,
    },
  });

  const [markers, setMaker] = useState(
    Array.from({ length: 0 }, (_, i) => makeMarker(i + 1))
  );

  const [polygons] = useState(
    Array.from({ length: 1 }, (_, i) => makePolygon(i + 1))
  );

  const [polylines] = useState(
    Array.from({ length: 1 }, (_, i) => makePolyline(i + 1))
  );

  const [circles] = useState(
    Array.from({ length: 1 }, (_, i) => makeCircle(i + 1))
  );

  const [heatmaps] = useState(
    Array.from({ length: 1 }, (_, i) => makeHeatmap(i + 1))
  );

  const [kmlLayers] = useState([{ id: '21', zIndex: 1, kmlString }]);

  useEffect(() => {
    if (!stressTest) return;

    const interval = setInterval(() => {
      setMaker((m) => {
        const newMarkers = [...m];
        while (newMarkers.length > 100) {
          newMarkers.shift();
        }
        for (let i = 0; i < 500; i++) {
          newMarkers.push(makeMarker(newMarkers.length + 1));
        }

        return newMarkers;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stressTest]);

  const mapStyle = useMemo(
    () => JSON.stringify(normalStyle ? standardMapStyle : silverMapStyle),
    [normalStyle]
  );

  const buttons = useMemo(() => {
    return [
      {
        title: 'Set Camera',
        onPress: () => {
          const camera = {
            center: { latitude: 37.7749, longitude: -122.4194 },
            zoom: 15,
          };
          mapRef.current?.setCamera(camera, true, 350);
        },
      },
      {
        title: 'Set Camera to coordinates',
        onPress: () => {
          mapRef.current?.setCameraToCoordinates(
            markers.map((e) => e.coordinate),
            { top: 0, left: 0, bottom: 0, right: 0 },
            true,
            350
          );
        },
      },
      {
        title: `${stressTest ? 'Stop' : 'Start'} stress test`,
        onPress: () => setStressTest(!stressTest),
      },
      {
        title: 'request location permission',
        onPress: async () => {
          const permission = await mapRef.current?.requestLocationPermission();
          console.log('Permission request result', permission);
        },
      },
      {
        title: 'Test Nitro module',
        onPress: () => {
          GoogleMapsModule.openLocationSettings();
        },
      },
      {
        title: `Style: ${normalStyle ? 'Normal' : 'Standard'}`,
        onPress: () => setNormalStyle(!normalStyle),
      },
      {
        title: 'Marker -1',
        onPress: () => setMaker(markers.slice(0, markers.length - 1)),
      },
      {
        title: 'Marker +1',
        onPress: () => setMaker([...markers, makeMarker(markers.length + 1)]),
      },
      {
        title: 'isGooglePlayServicesAvailable',
        onPress: () =>
          console.log(mapRef.current?.isGooglePlayServicesAvailable()),
      },
    ];
  }, [markers, normalStyle, stressTest]);

  return (
    <View style={styles.container}>
      <GoogleMapsView
        hybridRef={{
          f: (ref) => {
            mapRef.current = ref;
          },
        }}
        initialProps={initialProps}
        uiSettings={uiSettings}
        onMapReady={callback((ready) => console.log('Map is ready! ' + ready))}
        style={styles.map}
        myLocationEnabled={true}
        buildingEnabled={true}
        trafficEnabled={true}
        indoorEnabled={true}
        customMapStyle={mapStyle}
        userInterfaceStyle={'light'}
        mapType={'normal'}
        mapZoomConfig={mapZoomConfig}
        mapPadding={mapPadding}
        locationConfig={locationConfig}
        onMapPress={{
          f: function (coordinate: RNLatLng): void {
            console.log('Map pressed', coordinate);
          },
        }}
        onMarkerPress={{
          f: function (id: string): void {
            console.log('Marker pressed', id);
          },
        }}
        onPolylinePress={{
          f: function (id: string): void {
            console.log('Polyline pressed', id);
          },
        }}
        onPolygonPress={{
          f: function (id: string): void {
            console.log('Polygon pressed', id);
          },
        }}
        onCirclePress={{
          f: function (id: string): void {
            console.log('Circle pressed', id);
          },
        }}
        onCameraChangeStart={{
          f: function (
            region: RNRegion,
            camera: RNCamera,
            isGesture: boolean
          ): void {
            console.log('Camera change started:', region, camera, isGesture);
          },
        }}
        onCameraChange={{
          f: function (
            region: RNRegion,
            camera: RNCamera,
            isGesture: boolean
          ): void {
            console.log('Camera change:', region, camera, isGesture);
          },
        }}
        onCameraChangeComplete={{
          f: function (
            region: RNRegion,
            camera: RNCamera,
            isGesture: boolean
          ): void {
            console.log('Camera change completed:', region, camera, isGesture);
          },
        }}
        onLocationUpdate={{
          f: function (l: RNLocation): void {
            console.log('Location updated:', l);
          },
        }}
        onLocationError={{
          f: function (error): void {
            console.log('Location error:', error);
          },
        }}
        markers={markers}
        polygons={polygons}
        polylines={polylines}
        circles={circles}
        heatmaps={heatmaps}
        kmlLayers={kmlLayers}
      />

      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setControlButtonsExpanded(!controlButtonsExpanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.headerText}>
            {controlButtonsExpanded ? 'Hide Controls' : 'Show Controls'}
          </Text>
        </TouchableOpacity>

        {controlButtonsExpanded && (
          <View style={styles.buttonList}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={styles.button}
                onPress={btn.onPress}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: { position: 'absolute', bottom: 0, padding: 10 },
  header: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
    marginBottom: 10,
  },
  headerText: { fontWeight: '600', fontSize: 16 },
  buttonList: { gap: 5 },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
