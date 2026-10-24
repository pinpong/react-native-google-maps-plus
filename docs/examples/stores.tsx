/**
 * Store locator
 *
 * Coffee shops around the user. Tapping a pin selects the store: its pin turns
 * green and a card with name, rating and opening hours appears above it. Both
 * the pins and the card are SVG markers.
 *
 * @alt Coffee shop pins around Union Square, one selected with a card showing name, rating and opening hours, and the user location
 * @props markers, onMarkerPress
 */
import React, { useMemo, useState } from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';
import { callback } from 'react-native-nitro-modules';

import {
  BOLD,
  GREEN,
  INK,
  REGULAR,
  Z,
  lightStyle,
  ll,
  marker,
  pinZ,
  svg,
  youAreHere,
} from './shared';

const stores = [
  {
    id: 'corner',
    name: 'Corner Coffee',
    rating: '4.8',
    at: ll(37.7838, -122.4032),
  },
  { id: 'roast', name: 'Roast Lab', rating: '4.6', at: ll(37.7905, -122.4005) },
  { id: 'pier', name: 'Pier Beans', rating: '4.5', at: ll(37.7868, -122.4105) },
  { id: 'mint', name: 'Mint Cafe', rating: '4.4', at: ll(37.7808, -122.4065) },
  { id: 'hill', name: 'Hill Brew', rating: '4.7', at: ll(37.7942, -122.4118) },
  {
    id: 'dock',
    name: 'Dock Espresso',
    rating: '4.3',
    at: ll(37.7835, -122.3955),
  },
  { id: 'civic', name: 'Civic Cup', rating: '4.2', at: ll(37.7768, -122.4142) },
  {
    id: 'jackson',
    name: 'Jackson Coffee',
    rating: '4.6',
    at: ll(37.7965, -122.4022),
  },
];

// A pin with a coffee cup, top and bottom color of the gradient.
function pin(top: string, bottom: string, scale = 1) {
  return svg(
    42 * scale,
    54 * scale,
    `<defs>
       <linearGradient id="pin" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${top}"/>
         <stop offset="1" stop-color="${bottom}"/>
       </linearGradient>
     </defs>
     <g transform="scale(${scale})">
       <ellipse cx="21" cy="51" rx="7.5" ry="2.6" fill="#000000" opacity="0.22"/>
       <path d="M21 50 C21 50 3 33.5 3 20 a18 18 0 0 1 36 0 c0 13.5 -18 30 -18 30 Z" fill="url(#pin)" stroke="#ffffff" stroke-width="2.5"/>
       <circle cx="21" cy="19.5" r="12.5" fill="#ffffff"/>
       <g transform="translate(21 19.5) scale(0.8) translate(-21 -19.5)">
         <path d="M17.2 9.6 c-1.6 1.6 1.6 2.6 0 4.2 M21 9 c-1.6 1.6 1.6 2.6 0 4.2 M24.8 9.6 c-1.6 1.6 1.6 2.6 0 4.2" fill="none" stroke="${bottom}" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M14 16 h13 v4.5 a6.5 6.5 0 0 1 -13 0 Z" fill="${bottom}"/>
         <path d="M27 17.2 h1.6 a2.6 2.6 0 0 1 0 5.2 h-2" fill="none" stroke="${bottom}" stroke-width="1.6"/>
         <ellipse cx="20.5" cy="27.4" rx="8.5" ry="1.6" fill="${bottom}"/>
       </g>
     </g>`
  );
}

const pinIcon = pin('#9a6240', '#5b3420');
const selectedIcon = pin('#16a374', GREEN, 1.25);

// The card sits above the selected pin, its pointer ends at the pin's head.
function card(name: string, rating: string) {
  const w = 196;
  const h = 64;
  return svg(
    w,
    h + 10,
    `<rect x="2" y="5" width="${w - 4}" height="${h - 4}" rx="12" fill="#000000" opacity="0.16"/>
     <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="12" fill="#ffffff"/>
     <path d="M${w / 2 - 8} ${h - 3} L${w / 2} ${h + 7} L${w / 2 + 8} ${h - 3} Z" fill="#ffffff"/>
     <text x="16" y="25" font-size="15" ${BOLD} fill="${INK}">${name}</text>
     <path transform="translate(141 13) scale(0.62)" d="M10 1 L12.9 6.9 L19.5 7.8 L14.7 12.4 L15.9 19 L10 15.8 L4.1 19 L5.3 12.4 L0.5 7.8 L7.1 6.9 Z" fill="#f59f00"/>
     <text x="156" y="25" font-size="13" ${BOLD} fill="${INK}">${rating}</text>
     <text x="16" y="45" font-size="12.5" ${BOLD} fill="${GREEN}">Open<tspan ${REGULAR} fill="#66707a"> until 7 pm, 0.3 mi</tspan></text>`
  );
}

export default function StoreLocator() {
  const [selectedId, setSelectedId] = useState('corner');
  const selected = stores.find((store) => store.id === selectedId)!;

  // Nitro passes functions to native views wrapped in callback().
  const onMarkerPress = useMemo(
    () =>
      callback((id: string) => {
        if (stores.some((store) => store.id === id)) setSelectedId(id);
      }),
    []
  );

  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7866, -122.4032), zoom: 14.1 } }}
      onMarkerPress={onMarkerPress}
      markers={[
        ...stores.map(({ id, at }) =>
          id === selectedId
            ? marker(id, at, selectedIcon, {
                anchor: { x: 0.5, y: 0.94 },
                zIndex: Z.selected,
              })
            : marker(id, at, pinIcon, {
                anchor: { x: 0.5, y: 0.94 },
                zIndex: pinZ(at),
              })
        ),
        marker('card', selected.at, card(selected.name, selected.rating), {
          anchor: { x: 0.5, y: 1 + 62 / 74 },
          zIndex: Z.label,
        }),
        marker('user', ll(37.7812, -122.4098), youAreHere, { zIndex: Z.user }),
      ]}
    />
  );
}
