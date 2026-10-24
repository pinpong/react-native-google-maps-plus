/**
 * Transit network
 *
 * BART and Muni Metro lines through San Francisco as polylines with a white
 * casing, stations as small SVG markers and station names as labels next to
 * them. Where BART and Muni share Market Street, Muni is drawn beside BART.
 *
 * @alt BART and Muni Metro lines through San Francisco with stations and station names
 * @props polylines, markers
 */
import React from 'react';

import {
  GoogleMapsView,
  type RNLatLng,
  type RNPolyline,
} from 'react-native-google-maps-plus';

import {
  ABOVE,
  GREEN,
  LEFT,
  RIGHT,
  Z,
  dot,
  label,
  lightStyle,
  ll,
  marker,
} from './shared';

const BART = '#1c6dd0';
const MUNI = '#7048e8';
const J_CHURCH = '#e8590c';
const T_THIRD = '#c2255c';

// Muni runs next to BART under Market Street, offset to the north west.
const besideBart = (p: RNLatLng) =>
  ll(p.latitude + 0.0011, p.longitude - 0.0015);

const bart = [
  ll(37.8044, -122.33),
  ll(37.8, -122.3745),
  ll(37.7955, -122.3925),
  ll(37.7929, -122.3971), // Embarcadero
  ll(37.7894, -122.4013), // Montgomery St
  ll(37.7844, -122.4079), // Powell St
  ll(37.7795, -122.4139), // Civic Center
  ll(37.7738, -122.4187),
  ll(37.765, -122.4196), // 16th St Mission
  ll(37.7522, -122.4184), // 24th St Mission
  ll(37.744, -122.4205),
  ll(37.7331, -122.4338), // Glen Park
  ll(37.7219, -122.4474), // Balboa Park
];
const bartStations = [3, 4, 5, 6, 8, 9, 11, 12];

const muni = [
  besideBart(bart[3]!),
  besideBart(bart[4]!),
  besideBart(bart[5]!),
  besideBart(bart[6]!),
  ll(37.7765, -122.4185),
  ll(37.7751, -122.4193), // Van Ness
  ll(37.7671, -122.429), // Church
  ll(37.7626, -122.4351), // Castro
  ll(37.7481, -122.459), // Forest Hill
  ll(37.7408, -122.4656), // West Portal
];
const muniStations = [5, 6, 7, 8, 9];

const nJudah = [
  ll(37.7695, -122.429),
  ll(37.7695, -122.4372),
  ll(37.7657, -122.4498),
  ll(37.7621, -122.4664),
  ll(37.7605, -122.5089),
];

const jChurch = [
  ll(37.7671, -122.429),
  ll(37.7605, -122.4285),
  ll(37.7505, -122.4275),
  ll(37.742, -122.4268),
];

const tThird = [
  ll(37.7946, -122.4078), // Chinatown
  ll(37.7865, -122.4074), // Union Square
  ll(37.7832, -122.4013), // Yerba Buena
  ll(37.7786, -122.3973), // 4th and Brannan
  ll(37.7765, -122.3946),
  ll(37.7685, -122.389),
  ll(37.7604, -122.388),
  ll(37.745, -122.3878),
  ll(37.733, -122.3912),
];
const tStations = [0, 1, 2, 3];

// Lines are drawn with a white casing, the casings stay below all lines.
function line(
  id: string,
  coordinates: RNLatLng[],
  color: string,
  width: number
) {
  const base = { coordinates, lineCap: 'round', lineJoin: 'round' } as const;
  return [
    {
      ...base,
      id: `${id}-casing`,
      color: '#ffffff',
      width: width + 5,
      zIndex: 1,
    },
    { ...base, id, color, width, zIndex: 2 },
  ] satisfies RNPolyline[];
}

const stations = (
  prefix: string,
  points: RNLatLng[],
  indices: number[],
  color: string
) =>
  indices.map((i) =>
    marker(`${prefix}-${i}`, points[i]!, dot(color, 3.5, 2.5), {
      zIndex: Z.dot,
    })
  );

export default function TransitNetwork() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7705, -122.4165), zoom: 12.4 } }}
      polylines={[
        ...line('bart', bart, BART, 8),
        ...line('muni', muni, MUNI, 6),
        ...line('n-judah', nJudah, GREEN, 6),
        ...line('j-church', jChurch, J_CHURCH, 6),
        ...line('t-third', tThird, T_THIRD, 6),
      ]}
      markers={[
        ...stations('bart', bart, bartStations, BART),
        ...stations('muni', muni, muniStations, MUNI),
        ...stations('t', tThird, tStations, T_THIRD),
        label('embarcadero', bart[3]!, 'Embarcadero', ABOVE, { size: 11 }),
        label('civic-center', bart[6]!, 'Civic Center', RIGHT, { size: 11 }),
        label('16th', bart[8]!, '16th St Mission', RIGHT, { size: 11 }),
        label('castro', muni[7]!, 'Castro', LEFT, { size: 11 }),
        label('chinatown', tThird[0]!, 'Chinatown', LEFT, { size: 11 }),
      ]}
    />
  );
}
