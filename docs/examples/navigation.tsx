/**
 * Navigation
 *
 * Turn-by-turn navigation on a tilted camera with 3D buildings, shortly before
 * the next turn. The camera bearing follows the route, the position puck is a
 * flat marker and the turn is an SVG marker above the intersection. iOS draws
 * 3D buildings only above zoom 17.
 *
 * @alt Turn-by-turn navigation on a tilted map of downtown San Francisco with a turn instruction onto 5th Street
 * @props mapOptions, polylines, markers, buildingEnabled
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import {
  BLUE,
  BOLD,
  INK,
  Z,
  bearing,
  lightStyle,
  ll,
  marker,
  svg,
  withCasing,
} from './shared';

const route = [
  ll(37.7894, -122.4011),
  ll(37.7868, -122.4044),
  ll(37.7844, -122.4076),
  ll(37.7826, -122.4053),
  ll(37.7808, -122.403),
];
// On Market Street, about 200 m before the turn into 5th Street.
const position = ll(37.78535, -122.40634);
const heading = bearing(position, route[2]!);

const puck = svg(
  44,
  44,
  `<circle cx="22" cy="22" r="21" fill="${BLUE}" opacity="0.16"/>
   <circle cx="22" cy="22" r="15" fill="#ffffff"/>
   <path transform="translate(22 21) scale(0.85) translate(-22 -21)" d="M22 9.5 L31 31 L22 26.5 L13 31 Z" fill="${BLUE}" stroke="${BLUE}" stroke-width="1.5" stroke-linejoin="round"/>`
);

// A dark callout with a turn arrow, its tip points at the intersection.
function turn(text: string) {
  const w = Math.round(text.length * 8.4 + 52);
  return svg(
    w,
    50,
    `<rect x="2" y="5" width="${w - 4}" height="36" rx="10" fill="#000000" opacity="0.2"/>
     <path d="M${w / 2 - 7} 38 L${w / 2} 47 L${w / 2 + 7} 38 Z" fill="${INK}"/>
     <rect x="2" y="2" width="${w - 4}" height="36" rx="10" fill="${INK}"/>
     <path d="M24 28 V18 a4 4 0 0 0 -4 -4 H15" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
     <path d="M18 9.5 L13 14 L18 18.5" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
     <text x="36" y="20" dominant-baseline="central" font-size="14" ${BOLD} fill="#ffffff">${text}</text>`
  );
}

export default function Navigation() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      buildingEnabled
      mapOptions={{
        camera: {
          center: ll(37.78475, -122.40686),
          zoom: 17.5,
          tilt: 55,
          bearing: heading,
        },
      }}
      polylines={withCasing('route', [position, ...route.slice(2)], BLUE, 9)}
      markers={[
        marker('position', position, puck, {
          flat: true,
          rotation: heading,
          zIndex: Z.user,
        }),
        marker('turn', route[2]!, turn('Turn left onto 5th St'), {
          anchor: { x: 0.5, y: 1.05 },
          zIndex: Z.label,
        }),
      ]}
    />
  );
}
