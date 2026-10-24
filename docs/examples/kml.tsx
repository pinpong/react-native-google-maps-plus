/**
 * KML layers
 *
 * Sales territories from a KML document: polygons with their own line and
 * fill styles, and placemarks for the offices. The KML is passed as a string.
 *
 * @alt Three sales territories over San Francisco from a KML document, each in its own color, with office placemarks
 * @props kmlLayers
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import { lightStyle, ll } from './shared';

type Territory = { name: string; color: string; outline: [number, number][] };

// KML colors are aabbggrr.
const territories: Territory[] = [
  {
    name: 'North',
    color: '4f6e0b',
    outline: [
      [-122.515, 37.811],
      [-122.358, 37.812],
      [-122.385, 37.777],
      [-122.441, 37.781],
      [-122.512, 37.773],
    ],
  },
  {
    name: 'Southwest',
    color: '0f48d9',
    outline: [
      [-122.512, 37.773],
      [-122.441, 37.781],
      [-122.428, 37.742],
      [-122.441, 37.708],
      [-122.506, 37.708],
    ],
  },
  {
    name: 'Southeast',
    color: 'e84870',
    outline: [
      [-122.441, 37.781],
      [-122.385, 37.777],
      [-122.357, 37.722],
      [-122.381, 37.708],
      [-122.441, 37.708],
      [-122.428, 37.742],
    ],
  },
];

const offices: [string, number, number][] = [
  ['Downtown', -122.4012, 37.7915],
  ['Sunset', -122.4862, 37.7535],
  ['Bayview', -122.3895, 37.7302],
];

const coordinates = (outline: [number, number][]) =>
  [...outline, outline[0]!].map(([lng, lat]) => `${lng},${lat},0`).join(' ');

const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    ${territories
      .map(
        ({ name, color, outline }) => `
    <Style id="${name}">
      <LineStyle><color>ff${color}</color><width>3</width></LineStyle>
      <PolyStyle><color>40${color}</color></PolyStyle>
    </Style>
    <Placemark>
      <name>${name}</name>
      <styleUrl>#${name}</styleUrl>
      <Polygon>
        <outerBoundaryIs><LinearRing>
          <coordinates>${coordinates(outline)}</coordinates>
        </LinearRing></outerBoundaryIs>
      </Polygon>
    </Placemark>`
      )
      .join('')}
    ${offices
      .map(
        ([name, lng, lat]) => `
    <Placemark>
      <name>${name}</name>
      <Point><coordinates>${lng},${lat},0</coordinates></Point>
    </Placemark>`
      )
      .join('')}
  </Document>
</kml>`;

export default function KmlLayers() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.759, -122.436), zoom: 11.3 } }}
      kmlLayers={[{ id: 'territories', kmlString: kml }]}
    />
  );
}
