import type {
  RNMarker,
  RNPolygon,
  RNPolyline,
  RNCircle,
  RNHeatmap,
} from 'react-native-google-maps-plus';

export function randomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

export function makeSvgIcon(width: number, height: number): string {
  const color = randomColor();
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

export const randomWeightedCoordinates = (
  baseLat: number,
  baseLng: number,
  offset = 0.01
) => ({
  latitude: baseLat + (Math.random() - 0.5) * offset,
  longitude: baseLng + (Math.random() - 0.5) * offset,
  weight: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
});

export const makePolygon = (id: number): RNPolygon => ({
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

export const makePolyline = (id: number): RNPolyline => ({
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

export const makeCircle = (id: number): RNCircle => ({
  id: id.toString(),
  zIndex: id,
  pressable: true,
  center: randomCoordinates(37.7749, -122.4194, 0.02),
  radius: 100 + (id % 5),
  strokeWidth: 1 + (id % 5),
  strokeColor: '#ff0000',
  fillColor: '#0000ff',
});

export const makeHeatmap = (id: number): RNHeatmap => ({
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
