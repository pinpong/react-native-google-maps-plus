/**
 * Scooter sharing
 *
 * Scooters around the user, each with a battery ring that is drawn as an SVG
 * arc. The circle shows the walking distance.
 *
 * @alt Scooter markers with battery rings around the user location in SoMa
 * @props markers, circles
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import {
  INK,
  Z,
  lightStyle,
  ll,
  marker,
  pinZ,
  svg,
  youAreHere,
} from './shared';

const user = ll(37.7728, -122.4122);

const scooters: [number, number, number][] = [
  [37.77, -122.408, 0.92],
  [37.7748, -122.4142, 0.64],
  [37.7695, -122.4172, 0.31],
  [37.7768, -122.4068, 0.85],
  [37.7731, -122.4029, 0.12],
  [37.7662, -122.4092, 0.56],
  [37.7795, -122.4112, 0.74],
];

// SVG arc for a share of a circle, starting at the top, clockwise.
function arc(cx: number, cy: number, r: number, share: number) {
  const a0 = -Math.PI / 2;
  const a1 = a0 + 2 * Math.PI * Math.min(share, 0.999);
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function scooter(charge: number) {
  const color = charge > 0.5 ? '#2fb344' : charge > 0.2 ? '#f59f00' : '#e03131';
  return svg(
    44,
    54,
    `<ellipse cx="22" cy="51" rx="7" ry="2.4" fill="#000000" opacity="0.2"/>
     <path d="M16 38 L22 49 L28 38 Z" fill="#ffffff"/>
     <circle cx="22" cy="21" r="20" fill="#ffffff"/>
     <circle cx="22" cy="21" r="16.5" fill="none" stroke="#e3e7eb" stroke-width="3.5"/>
     <path d="${arc(22, 21, 16.5, charge)}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
     <circle cx="22" cy="21" r="12.5" fill="${INK}"/>
     <g transform="translate(22 21) scale(0.8) translate(-22 -21)">
       <circle cx="16" cy="26" r="2.6" fill="none" stroke="#ffffff" stroke-width="1.6"/>
       <circle cx="28.5" cy="26" r="2.6" fill="none" stroke="#ffffff" stroke-width="1.6"/>
       <path d="M16 26 H26 L27 14 M24.5 14 H29.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
     </g>`
  );
}

export default function ScooterSharing() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7738, -122.4098), zoom: 14.05 } }}
      circles={[
        {
          id: 'walk',
          center: user,
          radius: 350,
          strokeColor: 'rgba(26, 115, 232, 0.5)',
          strokeWidth: 2,
          fillColor: 'rgba(26, 115, 232, 0.06)',
        },
      ]}
      markers={[
        ...scooters.map(([lat, lng, charge], i) => {
          const at = ll(lat, lng);
          return marker(`scooter-${i}`, at, scooter(charge), {
            anchor: { x: 0.5, y: 0.93 },
            zIndex: pinZ(at),
          });
        }),
        marker('user', user, youAreHere, { zIndex: Z.user }),
      ]}
    />
  );
}
