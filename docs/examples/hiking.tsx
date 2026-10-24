/**
 * Outdoor tracking
 *
 * A recorded hike on the terrain map: the GPS track as a polyline, kilometer
 * markers computed along it, the start and the summit.
 *
 * @alt A hiking loop on Mount Tamalpais on the terrain map, with kilometer markers and the East Peak summit
 * @props polylines, markers, mapType
 */
import React from 'react';

import {
  GoogleMapsView,
  type RNLatLng,
  type RNMarker,
} from 'react-native-google-maps-plus';

import {
  BOLD,
  GREEN,
  INK,
  ORANGE,
  Z,
  distance,
  ll,
  marker,
  pill,
  seeded,
  svg,
  withCasing,
} from './shared';

const waypoints = [
  ll(37.9039, -122.604),
  ll(37.9068, -122.6012),
  ll(37.9096, -122.5975),
  ll(37.9132, -122.5952),
  ll(37.9168, -122.5918),
  ll(37.9205, -122.5872),
  ll(37.9238, -122.5838),
  ll(37.9262, -122.5806),
  ll(37.9288, -122.5779),
  ll(37.9262, -122.5752),
  ll(37.9222, -122.5768),
  ll(37.918, -122.5801),
  ll(37.9141, -122.5838),
  ll(37.9102, -122.5881),
  ll(37.9071, -122.5934),
  ll(37.9052, -122.5988),
  ll(37.9039, -122.604),
];
const summitAt = ll(37.9288, -122.5779);

// A recorded track has a point every few meters and some GPS noise.
function record(points: RNLatLng[], step: number, noise: number) {
  const rand = seeded(41);
  const track: RNLatLng[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const n = Math.max(1, Math.round(distance(a, b) / step));
    for (let k = 0; k < n; k++) {
      const f = k / n;
      track.push(
        ll(
          a.latitude + (b.latitude - a.latitude) * f + (rand() - 0.5) * noise,
          a.longitude +
            (b.longitude - a.longitude) * f +
            (rand() - 0.5) * noise * 1.27
        )
      );
    }
  }
  return [...track, points[points.length - 1]!];
}

const track = record(waypoints, 45, 0.00012);

function kilometerMarkers() {
  const markers: RNMarker[] = [];
  let meters = 0;
  let next = 1000;
  for (let i = 1; i < track.length; i++) {
    meters += distance(track[i - 1]!, track[i]!);
    if (meters < next) continue;
    const km = next / 1000;
    markers.push(
      marker(
        `km-${km}`,
        track[i]!,
        svg(
          24,
          24,
          `<circle cx="12" cy="12" r="10.5" fill="#ffffff" stroke="${ORANGE}" stroke-width="2.5"/>
           <text x="12" y="12.5" text-anchor="middle" dominant-baseline="central" font-size="11" ${BOLD} fill="${INK}">${km}</text>`
        ),
        { zIndex: Z.dot }
      )
    );
    next += 1000;
  }
  return markers;
}

// The summit name above a round badge with a snow capped mountain.
function summit(name: string) {
  const p = pill(name, { size: 12 });
  const cx = p.width / 2;
  const cy = p.height + 20;
  const h = p.height + 44;
  return svg(
    p.width,
    h,
    `${p.body}
     <defs>
       <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="#4dabf7"/>
         <stop offset="1" stop-color="#1c7ed6"/>
       </linearGradient>
     </defs>
     <path d="M${cx - 6} ${cy + 15} L${cx} ${cy + 23} L${cx + 6} ${cy + 15} Z" fill="#ffffff"/>
     <circle cx="${cx}" cy="${cy}" r="17" fill="#ffffff"/>
     <circle cx="${cx}" cy="${cy}" r="14" fill="url(#sky)"/>
     <g transform="translate(${cx} ${cy}) scale(0.85) translate(${-cx} ${-cy})">
       <path d="M${cx - 11} ${cy + 7} L${cx - 3} ${cy - 6} L${cx + 1} ${cy} L${cx + 4} ${cy - 3} L${cx + 11} ${cy + 7} Z" fill="#2b3a42"/>
       <path d="M${cx - 5.4} ${cy - 2.1} L${cx - 3} ${cy - 6} L${cx - 0.6} ${cy - 2.2} L${cx - 2} ${cy - 3} Z" fill="#ffffff"/>
     </g>`
  );
}

const startIcon = svg(
  30,
  30,
  `<circle cx="15" cy="15" r="13" fill="${GREEN}" stroke="#ffffff" stroke-width="3"/>
   <g transform="translate(15 15) scale(0.85) translate(-15 -15)">
     <path d="M11 8 v14" stroke="#ffffff" stroke-width="2"/>
     <path d="M11.5 8.5 h8 l-2 3 l2 3 h-8 Z" fill="#ffffff"/>
   </g>`
);

export default function OutdoorTracking() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      mapType="terrain"
      mapOptions={{ camera: { center: ll(37.9168, -122.5878), zoom: 13.05 } }}
      polylines={withCasing('track', track, ORANGE, 5)}
      markers={[
        ...kilometerMarkers(),
        marker('start', track[0]!, startIcon, { zIndex: Z.pin }),
        marker('summit', summitAt, summit('East Peak 784 m'), {
          anchor: { x: 0.5, y: 1 },
          zIndex: Z.label,
        }),
      ]}
    />
  );
}
