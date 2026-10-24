/**
 * EV charging
 *
 * Charging stations with free and total chargers. The color follows the
 * availability, a full station is grey.
 *
 * @alt EV charging stations with free and total charger counts, colored by availability
 * @props markers
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import { BOLD, ORANGE, lightStyle, ll, marker, pinZ, svg } from './shared';

const stations: [number, number, number, number][] = [
  [37.7905, -122.4005, 3, 4],
  [37.7848, -122.4108, 1, 4],
  [37.7801, -122.4035, 0, 2],
  [37.7942, -122.4108, 5, 6],
  [37.7869, -122.3958, 2, 2],
  [37.7765, -122.4135, 1, 6],
];

function charger(free: number, total: number) {
  const [light, dark] =
    free === 0
      ? ['#868e96', '#5c636a']
      : free / total < 0.5
        ? ['#f59f00', ORANGE]
        : ['#2fb344', '#1e8a33'];
  return svg(
    72,
    48,
    `<defs>
       <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${light}"/>
         <stop offset="1" stop-color="${dark}"/>
       </linearGradient>
     </defs>
     <rect x="2" y="5" width="68" height="34" rx="17" fill="#000000" opacity="0.18"/>
     <path d="M30 35 L36 45 L42 35 Z" fill="${dark}"/>
     <rect x="2" y="2" width="68" height="34" rx="17" fill="url(#bg)"/>
     <circle cx="19" cy="19" r="12" fill="#ffffff"/>
     <path transform="translate(19 19) scale(0.8) translate(-19 -19)" d="M20.5 10.5 L13.5 20.5 H18.5 L17 27.5 L24.5 17 H19.5 Z" fill="${dark}"/>
     <text x="50.5" y="19" text-anchor="middle" dominant-baseline="central" font-size="15" ${BOLD} fill="#ffffff">${free}/${total}</text>`
  );
}

export default function EvCharging() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7858, -122.4058), zoom: 13.6 } }}
      markers={stations.map(([lat, lng, free, total], i) => {
        const at = ll(lat, lng);
        return marker(`station-${i}`, at, charger(free, total), {
          anchor: { x: 0.5, y: 0.94 },
          zIndex: pinZ(at),
        });
      })}
    />
  );
}
