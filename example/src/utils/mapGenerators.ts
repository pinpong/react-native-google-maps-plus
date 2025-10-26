import type {
  RNCircle,
  RNHeatmap,
  RNMarker,
  RNPolygon,
  RNPolyline,
  RNUrlTileOverlay,
} from 'react-native-google-maps-plus';
import { weightData } from './heatMapWeightData';

export function randomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

export function makeSvgIcon(
  width: number,
  height: number,
  color?: string
): string {
  color = color ?? randomColor();
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 88">
  <path d="M32 2c-14.36 0-26 11.64-26 26 0 18.2 20.67 38.86 24.82 43.02a1.7 1.7 0 0 0 2.36 0C37.33 66.86 58 46.2 58 28 58 13.64 46.36 2 32 2z" fill="${color}" />
  <circle cx="32" cy="28" r="10" fill="#FFFFFF" />
  <ellipse cx="32" cy="82" rx="14" ry="4" fill="#000000" opacity="0.15" />
</svg>`;
}

export const randomCoordinates = (
  baseLat: number,
  baseLng: number,
  offset = 0.01
) => ({
  latitude: baseLat + (Math.random() - 0.5) * offset,
  longitude: baseLng + (Math.random() - 0.5) * offset,
});

export const makePolygon = (id: number): RNPolygon => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  coordinates: [
    { latitude: 37.7749, longitude: -122.4194 },
    { latitude: 37.7799, longitude: -122.4194 },
    { latitude: 37.7799, longitude: -122.4144 },
    { latitude: 37.7749, longitude: -122.4144 },
  ],
  holes: [
    {
      coordinates: [
        { latitude: 37.776, longitude: -122.418 },
        { latitude: 37.778, longitude: -122.418 },
        { latitude: 37.778, longitude: -122.416 },
        { latitude: 37.776, longitude: -122.416 },
      ],
    },
  ],
  fillColor: '#0000ff',
  strokeColor: '#ff0000',
  strokeWidth: 1 + (id % 5),
});

export const makePolyline = (id: number): RNPolyline => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  coordinates: [
    {
      latitude: 37.768827809530706,
      longitude: -122.4094318055856,
    },
    {
      latitude: 37.769061988963294,
      longitude: -122.42813903044735,
    },
    {
      latitude: 37.78432665625552,
      longitude: -122.4146025550078,
    },
    {
      latitude: 37.77625509715684,
      longitude: -122.42576943109252,
    },
    {
      latitude: 37.781078997316904,
      longitude: -122.41360075209455,
    },
    {
      latitude: 37.78114738526304,
      longitude: -122.41118118480473,
    },
    {
      latitude: 37.76597525181739,
      longitude: -122.42891273762548,
    },
    {
      latitude: 37.77486270614536,
      longitude: -122.42667530588818,
    },
  ],
  lineCap: 'square',
  lineJoin: 'round',
  color: '#ff0000',
  width: 3,
});

export const makeCircle = (id: number): RNCircle => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  center: {
    latitude: 37.78280299333499,
    longitude: -122.41439638994537,
  },
  radius: 250,
  strokeWidth: 2,
  strokeColor: '#ff0000',
  fillColor: '#0000ff',
});

export const makeHeatmap = (id: number): RNHeatmap => ({
  id: id.toString(),
  zIndex: id,
  weightedData: weightData,
  gradient: {
    colors: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
    startPoints: [0.1, 0.2, 0.45, 0.7, 1.0],
    colorMapSize: 256,
  },
  radius: 50,
  opacity: 1,
});

export function makeUrlTileOverlay(id: number): RNUrlTileOverlay {
  return {
    id: id.toString(),
    zIndex: id,
    fadeIn: false,
    opacity: 1,
    tileSize: 256,
    url: '',
  };
}

export function makeMarker(id: number): RNMarker {
  return {
    id: id.toString(),
    zIndex: id,
    coordinate: {
      latitude: 37.759135945148444,
      longitude: -122.43568673729897,
    },
    anchor: {
      x: 0.5,
      y: 1,
    },
    title: 'Marker title id: 1',
    snippet: 'Marker snippet id: 1',
    draggable: true,
    infoWindowAnchor: {
      x: 0.5,
      y: 0,
    },
    iconSvg: {
      width: 32,
      height: 44,
      svgString: makeSvgIcon(32, 44, '#2D6BE9'),
    },
  };
}

export function makeRandomMarkerForStressTest(id: number): RNMarker {
  const customIcon = id % 2 === 0;

  return {
    id: id.toString(),
    zIndex: id,
    coordinate: randomCoordinates(37.7749, -122.4194, 0.2),
    draggable: false,
    iconSvg: customIcon
      ? {
          width: (64 / 100) * 50,
          height: (88 / 100) * 50,
          svgString: makeSvgIcon(64, 88),
        }
      : undefined,
  };
}
