/**
 * City tour
 *
 * A walking tour with numbered stops, connected by a polyline. The names sit
 * next to their stop, on the side away from the route.
 *
 * @alt A walking tour with five numbered stops from the Ferry Building to Coit Tower
 * @props polylines, markers
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import {
  BELOW,
  BOLD,
  GREEN,
  LEFT,
  RIGHT,
  Z,
  label,
  lightStyle,
  ll,
  marker,
  svg,
  withCasing,
} from './shared';

const stops = [
  { at: ll(37.7955, -122.3937), name: 'Ferry Building', side: BELOW },
  { at: ll(37.7952, -122.4028) },
  { at: ll(37.7908, -122.4058), name: 'Chinatown', side: LEFT },
  { at: ll(37.8008, -122.41) },
  { at: ll(37.8024, -122.4058), name: 'Coit Tower', side: RIGHT },
];

function numbered(n: number) {
  return svg(
    36,
    36,
    `<defs>
       <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="#16a374"/>
         <stop offset="1" stop-color="${GREEN}"/>
       </linearGradient>
     </defs>
     <circle cx="18" cy="19.5" r="15" fill="#000000" opacity="0.18"/>
     <circle cx="18" cy="18" r="16" fill="#ffffff"/>
     <circle cx="18" cy="18" r="13" fill="url(#bg)"/>
     <text x="18" y="18.5" text-anchor="middle" dominant-baseline="central" font-size="15" ${BOLD} fill="#ffffff">${n}</text>`
  );
}

export default function CityTour() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7978, -122.4012), zoom: 13.85 } }}
      polylines={withCasing(
        'tour',
        stops.map((stop) => stop.at),
        GREEN,
        4
      )}
      markers={stops.flatMap((stop, i) => [
        marker(`stop-${i + 1}`, stop.at, numbered(i + 1), { zIndex: Z.pin }),
        ...(stop.name && stop.side
          ? [
              label(`name-${i + 1}`, stop.at, stop.name, stop.side, {
                size: 11,
              }),
            ]
          : []),
      ])}
    />
  );
}
