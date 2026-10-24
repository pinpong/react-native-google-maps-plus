/**
 * Ride tracking
 *
 * A car on its way to the drop-off. The car is a flat SVG marker rotated
 * along the route, the driven part of the route is grey, and the drop-off
 * shows the ETA.
 *
 * @alt A car on its way along Valencia Street, the driven part of the route in grey, the pickup point and the drop-off with a 3 minute ETA
 * @props polylines, markers
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import {
  GREEN,
  INK,
  Z,
  bearing,
  lightStyle,
  ll,
  marker,
  pill,
  svg,
  withCasing,
} from './shared';

const route = [
  ll(37.7651, -122.4218),
  ll(37.7722, -122.4228),
  ll(37.7752, -122.4193),
  ll(37.7795, -122.414),
  ll(37.7841, -122.4078),
  ll(37.7869, -122.404),
];
const car = ll(37.7694, -122.4224);

// A white sedan seen from above, the nose points north.
const carIcon = svg(
  24,
  46,
  `<defs>
     <linearGradient id="paint" x1="0" y1="0" x2="1" y2="0">
       <stop offset="0" stop-color="#dfe3e8"/>
       <stop offset="0.5" stop-color="#ffffff"/>
       <stop offset="1" stop-color="#dfe3e8"/>
     </linearGradient>
   </defs>
   <rect x="4" y="4" width="18" height="41" rx="7" fill="#000000" opacity="0.2"/>
   <rect x="3" y="2" width="18" height="41" rx="7" fill="url(#paint)" stroke="#9aa4ae" stroke-width="0.8"/>
   <path d="M2.2 15 L3.2 14.6 L3.2 16.6 Z M21.8 15 L20.8 14.6 L20.8 16.6 Z" fill="#9aa4ae"/>
   <path d="M5.6 13 Q12 9.8 18.4 13 L17.2 18.2 Q12 17 6.8 18.2 Z" fill="#26313b"/>
   <rect x="7" y="19" width="10" height="11" rx="2.2" fill="#f3f5f7" stroke="#d3d8de" stroke-width="0.5"/>
   <path d="M6.9 31 Q12 32.2 17.1 31 L17.8 35.2 Q12 36.8 6.2 35.2 Z" fill="#26313b"/>
   <path d="M4.6 18.6 L5.6 19.4 V29.6 L4.6 30.6 Z M19.4 18.6 L18.4 19.4 V29.6 L19.4 30.6 Z" fill="#26313b"/>
   <path d="M4.6 4.6 Q6 3 8.4 2.8 L8 4.8 Z M19.4 4.6 Q18 3 15.6 2.8 L16 4.8 Z" fill="#ffe8a3"/>
   <rect x="5" y="41.4" width="4" height="1.3" rx="0.6" fill="#e03131"/>
   <rect x="15" y="41.4" width="4" height="1.3" rx="0.6" fill="#e03131"/>`
);

const pickupIcon = svg(
  26,
  26,
  `<circle cx="13" cy="13" r="11" fill="${INK}"/>
   <circle cx="13" cy="13" r="4.5" fill="#ffffff"/>`
);

// The drop-off square with the ETA above it, anchored at the square's center.
function dropoff(eta: string) {
  const p = pill(eta, { size: 14, bg: GREEN, fg: '#ffffff' });
  const w = Math.max(p.width, 26);
  const x = (w - 22) / 2;
  const h = p.height + 30;
  return {
    icon: svg(
      w,
      h,
      `<g transform="translate(${(w - p.width) / 2} 0)">${p.body}</g>
       <path d="M${w / 2 - 6} ${p.height - 1} L${w / 2} ${p.height + 5} L${w / 2 + 6} ${p.height - 1} Z" fill="${GREEN}"/>
       <rect x="${x}" y="${p.height + 6}" width="22" height="22" rx="3" fill="${INK}"/>
       <rect x="${x + 7.5}" y="${p.height + 13.5}" width="7" height="7" fill="#ffffff"/>`
    ),
    anchor: { x: 0.5, y: (h - 13) / h },
  };
}

export default function RideTracking() {
  const end = dropoff('3 min');
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7762, -122.4134), zoom: 13.45 } }}
      polylines={[
        ...withCasing('driven', [route[0]!, car], '#9aa3ad', 6),
        ...withCasing('ahead', [car, ...route.slice(1)], INK, 6),
      ]}
      markers={[
        marker('pickup', route[0]!, pickupIcon, { zIndex: Z.pin }),
        marker('dropoff', route[route.length - 1]!, end.icon, {
          anchor: end.anchor,
          zIndex: Z.pin,
        }),
        marker('car', car, carIcon, {
          flat: true,
          rotation: bearing(car, route[1]!),
          zIndex: Z.selected,
        }),
      ]}
    />
  );
}
