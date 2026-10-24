/**
 * Flight routes
 *
 * Routes across the Atlantic as geodesic polylines, which follow the great
 * circle and curve on the map. The plane is a flat marker rotated to its
 * heading on the route to London.
 *
 * @alt Geodesic flight routes from New York and Boston to Europe, with a plane on its way to London
 * @props polylines, markers
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import {
  ABOVE,
  BELOW,
  GREEN,
  INK,
  Z,
  bearing,
  dot,
  greatCircle,
  label,
  lightStyle,
  ll,
  marker,
  svg,
} from './shared';

const airports = {
  JFK: ll(40.6413, -73.7781),
  BOS: ll(42.3656, -71.0096),
  LHR: ll(51.47, -0.4543),
  CDG: ll(49.0097, 2.5479),
  MAD: ll(40.4983, -3.5676),
  DUB: ll(53.4264, -6.2499),
  KEF: ll(63.985, -22.6056),
  LIS: ll(38.7742, -9.1342),
};
type Airport = keyof typeof airports;

const routes: [Airport, Airport][] = [
  ['JFK', 'LHR'],
  ['JFK', 'CDG'],
  ['JFK', 'MAD'],
  ['JFK', 'DUB'],
  ['JFK', 'KEF'],
  ['BOS', 'LHR'],
  ['BOS', 'LIS'],
];

const labels: [Airport, typeof ABOVE][] = [
  ['JFK', BELOW],
  ['BOS', ABOVE],
  ['LHR', BELOW],
  ['MAD', BELOW],
  ['KEF', ABOVE],
];

const plane = greatCircle(airports.JFK, airports.LHR, 0.58);

const planeIcon = svg(
  40,
  40,
  `<defs>
     <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
       <stop offset="0" stop-color="#0d1115"/>
       <stop offset="0.5" stop-color="#4a5866"/>
       <stop offset="1" stop-color="#0d1115"/>
     </linearGradient>
   </defs>
   <path transform="translate(20 20)" d="M0 -17 C1.6 -17 2.4 -15 2.4 -12 V-4 L16 4 V7.5 L2.4 3.5 V11 L6.5 14.5 V17 L0 15 L-6.5 17 V14.5 L-2.4 11 V3.5 L-16 7.5 V4 L-2.4 -4 V-12 C-2.4 -15 -1.6 -17 0 -17 Z" fill="url(#body)" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>`
);

export default function FlightRoutes() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(53.5, -36), zoom: 2.05 } }}
      polylines={routes.map(([from, to]) => {
        const active = from === 'JFK' && to === 'LHR';
        return {
          id: `${from}-${to}`,
          coordinates: [airports[from], airports[to]],
          geodesic: true,
          color: active ? GREEN : 'rgba(28, 35, 41, 0.55)',
          width: active ? 5 : 3,
          zIndex: active ? 3 : 2,
        };
      })}
      markers={[
        ...Object.entries(airports).map(([code, at]) =>
          marker(code, at, dot(INK, 3.5, 2.5), { zIndex: Z.dot })
        ),
        ...labels.map(([code, side]) =>
          label(`label-${code}`, airports[code], code, side, { size: 11 })
        ),
        marker('plane', plane, planeIcon, {
          flat: true,
          rotation: bearing(plane, airports.LHR),
          zIndex: Z.selected,
        }),
      ]}
    />
  );
}
