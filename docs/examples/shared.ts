// Helpers shared by the examples: map styles, colors, SVG building blocks and
// geometry. Marker icons are plain SVG strings, see the SVG markers guide.
import type {
  RNLatLng,
  RNMarker,
  RNMarkerSvg,
  RNPolyline,
} from 'react-native-google-maps-plus';

export const INK = '#1c2329';
export const GREEN = '#0b6e4f';
export const ORANGE = '#d9480f';
export const BLUE = '#1a73e8';

// Fonts bundled with the example app. font-weight has no effect on the system
// font fallback, so bold text names the bold font file.
export const BOLD = 'font-family="Roboto-Bold"';
export const REGULAR = 'font-family="Roboto-Regular"';

// A muted light style that lets the overlays stand out.
export const lightStyle = JSON.stringify([
  { elementType: 'geometry', stylers: [{ color: '#f1f2f4' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7b838d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f1f2f4' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'on' }, { color: '#c9ced4' }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#dcebdf' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e1e4e8' }],
  },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c8d9ea' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a9db2' }],
  },
]);

export const darkStyle = JSON.stringify([
  { elementType: 'geometry', stylers: [{ color: '#1b1e24' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7d8590' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1b1e24' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2f37' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#353b45' }],
  },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f1215' }],
  },
]);

// ---------- geometry

export const ll = (latitude: number, longitude: number): RNLatLng => ({
  latitude,
  longitude,
});

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Distance in meters. */
export function distance(a: RNLatLng, b: RNLatLng) {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b in degrees, clockwise from north. */
export function bearing(a: RNLatLng, b: RNLatLng) {
  const y =
    Math.sin(rad(b.longitude - a.longitude)) * Math.cos(rad(b.latitude));
  const x =
    Math.cos(rad(a.latitude)) * Math.sin(rad(b.latitude)) -
    Math.sin(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.cos(rad(b.longitude - a.longitude));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Point at fraction f of the great circle from a to b. */
export function greatCircle(a: RNLatLng, b: RNLatLng, f: number): RNLatLng {
  const p1 = rad(a.latitude);
  const l1 = rad(a.longitude);
  const p2 = rad(b.latitude);
  const l2 = rad(b.longitude);
  const d = distance(a, b) / 6371000;
  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
  const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
  const z = A * Math.sin(p1) + B * Math.sin(p2);
  return ll(
    deg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    deg(Math.atan2(y, x))
  );
}

/** Deterministic random numbers, so the example data looks the same each run. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// ---------- SVG

export const svg = (
  width: number,
  height: number,
  body: string
): RNMarkerSvg => ({
  width,
  height,
  svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
});

/** An SVG marker, anchored at the center of its icon unless set otherwise. */
export const marker = (
  id: string,
  coordinate: RNLatLng,
  iconSvg: RNMarkerSvg,
  options: Partial<RNMarker> = {}
): RNMarker => ({
  id,
  coordinate,
  iconSvg,
  anchor: { x: 0.5, y: 0.5 },
  ...options,
});

// Marker layers. Markers without a zIndex share 0 and overlap in no defined
// order, so every example sets one.
export const Z = {
  dot: 1,
  pin: 2,
  user: 2_000_000,
  selected: 3_000_000,
  label: 4_000_000,
};

/**
 * zIndex for pins: the further south, the further in front, so a pin lower on
 * the screen covers the tip of the one above it. Steps of about 11 m.
 */
export const pinZ = (p: RNLatLng) =>
  Z.pin + Math.round((90 - p.latitude) * 10000);

// Advance widths of Roboto Bold in em for the characters the examples use.
// SVG markers have no layout, so pills are sized from these.
const ADVANCE: Record<string, number> = {
  ' ': 0.25,
  ',': 0.22,
  '.': 0.27,
  '/': 0.4,
  '$': 0.56,
  'i': 0.25,
  'l': 0.25,
  'm': 0.87,
  'w': 0.76,
  'M': 0.87,
  'W': 0.88,
};

/** Estimated width of text set in Roboto Bold. */
export function textWidth(text: string, size: number) {
  let em = 0;
  for (const c of text) {
    if (ADVANCE[c] !== undefined) em += ADVANCE[c];
    else if (c >= '0' && c <= '9') em += 0.56;
    else if (c !== c.toLowerCase()) em += 0.66;
    else em += 0.55;
  }
  return em * size;
}

/**
 * A pill with a drop shadow, sized to the text. Returns the SVG body, so it
 * can be combined with other shapes.
 */
export function pill(
  text: string,
  { size = 13, bg = '#ffffff', fg = INK } = {}
) {
  const w = Math.round(textWidth(text, size) + size * 1.6);
  const h = Math.round(size * 2.1);
  return {
    width: w + 4,
    height: h + 5,
    body: `
      <rect x="2" y="4" width="${w}" height="${h}" rx="${h / 2}" fill="#000000" opacity="0.16"/>
      <rect x="2" y="2" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/>
      <text x="${2 + w / 2}" y="${2 + h / 2}" text-anchor="middle" dominant-baseline="central" font-size="${size}" ${BOLD} fill="${fg}">${text}</text>`,
  };
}

/**
 * A text label above everything else. The anchor can lie outside 0 to 1 to
 * move the label off its point, e.g. `{ x: -0.1, y: 0.5 }` puts it to the
 * right of the point.
 */
export function label(
  id: string,
  at: RNLatLng,
  text: string,
  anchor = { x: 0.5, y: 1 },
  options: Parameters<typeof pill>[1] = {}
): RNMarker {
  const p = pill(text, options);
  return marker(id, at, svg(p.width, p.height, p.body), {
    anchor,
    zIndex: Z.label,
  });
}

// Anchors that put a label next to its point.
export const RIGHT = { x: -0.12, y: 0.5 };
export const LEFT = { x: 1.12, y: 0.5 };
export const ABOVE = { x: 0.5, y: 1.35 };
export const BELOW = { x: 0.5, y: -0.35 };

/** A white dot in a colored ring, for stations and stops. */
export function dot(color: string, r = 6, ring = 3) {
  const s = (r + ring) * 2 + 2;
  return svg(
    s,
    s,
    `<circle cx="${s / 2}" cy="${s / 2}" r="${r + ring}" fill="${color}"/>
     <circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="#ffffff"/>`
  );
}

/** The user location, drawn as a marker. */
export const youAreHere = svg(
  40,
  40,
  `<circle cx="20" cy="20" r="19" fill="${BLUE}" opacity="0.18"/>
   <circle cx="20" cy="20" r="9.5" fill="#ffffff"/>
   <circle cx="20" cy="20" r="6.5" fill="${BLUE}"/>`
);

/** A line with a white casing below it, as navigation apps draw routes. */
export function withCasing(
  id: string,
  coordinates: RNLatLng[],
  color: string,
  width: number
): RNPolyline[] {
  const line = {
    coordinates,
    lineCap: 'round',
    lineJoin: 'round',
  } satisfies Partial<RNPolyline>;
  return [
    {
      ...line,
      id: `${id}-casing`,
      zIndex: 1,
      color: '#ffffff',
      width: width + 8,
    },
    { ...line, id, zIndex: 2, color, width },
  ];
}
