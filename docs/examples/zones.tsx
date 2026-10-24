/**
 * Delivery zones
 *
 * Delivery times around a restaurant as nested polygons, smallest on top. The
 * labels sit on the edge of each zone.
 *
 * @alt Delivery zones for 15, 30 and 45 minutes around a restaurant in the Mission District
 * @props polygons, markers
 */
import React from 'react';

import {
  GoogleMapsView,
  type RNLatLng,
  type RNPolygon,
} from 'react-native-google-maps-plus';

import {
  GREEN,
  INK,
  ORANGE,
  Z,
  label,
  lightStyle,
  ll,
  marker,
  seeded,
  svg,
} from './shared';

const restaurant = ll(37.7605, -122.4175);

const zones = [
  {
    minutes: 45,
    radius: 0.022,
    color: ORANGE,
    fill: 'rgba(217, 72, 15, 0.14)',
  },
  {
    minutes: 30,
    radius: 0.0145,
    color: '#e09a00',
    fill: 'rgba(240, 160, 0, 0.2)',
  },
  {
    minutes: 15,
    radius: 0.0075,
    color: GREEN,
    fill: 'rgba(11, 110, 79, 0.24)',
  },
];

// A smooth irregular outline around center, the way a travel time area looks.
function outline(center: RNLatLng, radius: number, seed: number) {
  const rand = seeded(seed);
  const p1 = rand() * 6;
  const p2 = rand() * 6;
  return Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI;
    const r =
      radius * (1 + 0.1 * Math.sin(2 * t + p1) + 0.05 * Math.cos(3 * t + p2));
    return ll(
      center.latitude + r * Math.cos(t),
      center.longitude + r * Math.sin(t) * 1.27
    );
  });
}

const restaurantIcon = svg(
  48,
  56,
  `<defs>
     <linearGradient id="badge" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0" stop-color="#3a4652"/>
       <stop offset="1" stop-color="${INK}"/>
     </linearGradient>
   </defs>
   <ellipse cx="24" cy="53" rx="8" ry="2.5" fill="#000000" opacity="0.22"/>
   <path d="M18 42 L24 52 L30 42 Z" fill="${INK}"/>
   <circle cx="24" cy="23" r="22" fill="#ffffff"/>
   <circle cx="24" cy="23" r="18.5" fill="url(#badge)"/>
   <g transform="translate(24 23) scale(0.8) translate(-24 -23)">
     <path d="M17 13 V20 a2.5 2.5 0 0 0 5 0 V13 M19.5 13 V33" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
     <path d="M30 33 V13 C27 14.5 26.5 19 26.5 22 C26.5 24 28 25 30 25" fill="#ffffff" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>
   </g>`
);

export default function DeliveryZones() {
  const outlines = zones.map((zone, i) =>
    outline(restaurant, zone.radius, 5 + i * 7)
  );
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: restaurant, zoom: 12.3 } }}
      polygons={zones.map((zone, i): RNPolygon => ({
        id: `zone-${zone.minutes}`,
        zIndex: i,
        coordinates: outlines[i]!,
        fillColor: zone.fill,
        strokeColor: zone.color,
        strokeWidth: 4,
      }))}
      markers={[
        marker('restaurant', restaurant, restaurantIcon, {
          anchor: { x: 0.5, y: 0.94 },
          zIndex: Z.selected,
        }),
        // On the east edge, at 150, 120 and 80 degrees.
        ...zones.map((zone, i) =>
          label(
            `label-${zone.minutes}`,
            outlines[i]![[30, 24, 16][i]!]!,
            `${zone.minutes} min`,
            { x: 0.5, y: 0.5 },
            { size: 11, bg: zone.color, fg: '#ffffff' }
          )
        ),
      ]}
    />
  );
}
