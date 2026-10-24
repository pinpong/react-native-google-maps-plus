/**
 * Analytics
 *
 * A heatmap of activity on a dark map style. iOS and Android compute the
 * color scale differently, so radius, weights and the gradient start points
 * are set per platform, see Limitations.
 *
 * @alt A heatmap over downtown San Francisco on a dark map style
 * @props heatmaps, customMapStyle
 */
import React from 'react';

import { Platform } from 'react-native';

import {
  GoogleMapsView,
  type RNHeatmapPoint,
  type RNLatLng,
} from 'react-native-google-maps-plus';

import { darkStyle, ll, seeded } from './shared';

// Points scattered around a center, denser in the middle.
function cluster(
  center: RNLatLng,
  count: number,
  spread: number,
  seed: number
): RNHeatmapPoint[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const r = spread * Math.sqrt(-2 * Math.log(rand() + 1e-9));
    const a = 2 * Math.PI * rand();
    return {
      latitude: center.latitude + r * Math.cos(a),
      longitude: center.longitude + r * Math.sin(a) * 1.25,
      weight: 1,
    };
  });
}

const points: RNHeatmapPoint[] = [
  ...cluster(ll(37.7879, -122.4075), 160, 0.0028, 7),
  ...cluster(ll(37.808, -122.4177), 70, 0.0022, 11),
  ...cluster(ll(37.7599, -122.4188), 90, 0.003, 13),
  ...cluster(ll(37.7786, -122.3893), 50, 0.002, 17),
  ...cluster(ll(37.7694, -122.448), 40, 0.0025, 19),
  ...cluster(ll(37.7955, -122.3937), 45, 0.0018, 23),
  ...cluster(ll(37.7749, -122.4194), 120, 0.011, 29),
];

const tuning = Platform.select({
  // Android scales the colors to the heaviest point. With equal weights every
  // point reaches the last color, one heavier point spreads the scale.
  android: {
    points: [...points, { ...ll(37.7879, -122.4075), weight: 14 }],
    radius: 12,
    startPoints: [0.1, 0.3, 0.55, 0.8, 1],
  },
  // iOS stays at the first colors in a city view, the scale starts lower.
  default: {
    points,
    radius: 36,
    startPoints: [0.006, 0.03, 0.07, 0.13, 0.22],
  },
});

export default function Analytics() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={darkStyle}
      mapOptions={{
        backgroundColor: '#1b1e24',
        camera: { center: ll(37.785, -122.4115), zoom: 12.75 },
      }}
      heatmaps={[
        {
          id: 'activity',
          weightedData: tuning.points,
          radius: tuning.radius,
          opacity: 0.9,
          gradient: {
            colors: ['#14b8a6', '#84cc16', '#facc15', '#fb923c', '#f43f5e'],
            startPoints: tuning.startPoints,
            colorMapSize: 256,
          },
        },
      ]}
    />
  );
}
