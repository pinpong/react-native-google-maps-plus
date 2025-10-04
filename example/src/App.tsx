import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const makePolygon = (id: number): RNPolygon => ({
  id: id.toString(),
  zIndex: id,
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
  coordinates: [
    randomCoordinates(37.7749, -122.4194, 0.02),
    randomCoordinates(37.7749, -122.4194, 0.02),
    randomCoordinates(37.7749, -122.4194, 0.02),
  ],

  lineCap: id % 2 === 0 ? 'round' : 'square',
  lineJoin: id % 3 === 0 ? 'bevel' : 'round',
  color: id % 2 === 0 ? '#ff0000' : '#0000ff',
  width: 1 + (id % 4),
});

export const makeMarker = (id: number): RNMarker => ({
  id: id.toString(),
  zIndex: id,
  coordinate: randomCoordinates(37.7749, -122.4194, 0.2),
  anchor: { x: 0.5, y: 1.0 },
  width: (64 / 100) * 50,
  height: (88 / 100) * 50,
  iconSvg: makeSvgIcon(64, 88),
});

export default function App() {
  const mapRef = useRef<GoogleMapsViewRef>(null);
  const [show, setShow] = useState(false);
  const [stressTest, setStressTest] = useState(false);
  const [normalStyle, setNormalStyle] = useState(true);
  const [controlButtonsExpanded, setControlButtonsExpanded] = useState(false);

  const [markers, setMaker] = useState(
    Array.from({ length: 0 }, (_, i) => makeMarker(i + 1))
  );

  const [polygons] = useState(
    Array.from({ length: 1 }, (_, i) => makePolygon(i + 1))
  );

  const [polylines] = useState(
    Array.from({ length: 1 }, (_, i) => makePolyline(i + 1))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (stressTest) {
        setMaker((m) => {
          let newMarkers = [...m];

          while (newMarkers.length > 100) {
            newMarkers.shift();
          }

          for (let i = 0; i < 500; i++) {
            newMarkers.push(makeMarker(newMarkers.length + 1));
          }

          return newMarkers;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [stressTest]);

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
        title: `${show ? 'Hide' : 'Show'} Marker`,
        onPress: () => setShow(!show),
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
  }, [markers, normalStyle, show, stressTest]);

  return (
    <View style={styles.container}>
      <GoogleMapsView
        hybridRef={{
          f: (ref) => {
            mapRef.current = ref;
          },
        }}
        onMapReady={callback((ready) => console.log('Map is ready! ' + ready))}
        style={styles.map}
        buildingEnabled={true}
        trafficEnabled={true}
        customMapStyle={JSON.stringify(
          normalStyle ? standardMapStyle : silverMapStyle
        )}
        initialCamera={{
          center: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          zoom: 15,
        }}
        userInterfaceStyle={'light'}
        mapType={'normal'}
        maxZoomLevel={20}
        minZoomLevel={0}
        mapPadding={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
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
        markers={show ? [...markers] : []}
        polygons={show ? polygons : []}
        polylines={show ? polylines : []}
      />

      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setControlButtonsExpanded(!controlButtonsExpanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.headerText}>
            {controlButtonsExpanded ? '▼ Hide Controls' : '▶ Show Controls'}
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
