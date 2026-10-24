<p align="center">
  <img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/logo.png" width="96" height="96" alt="" />
</p>

<h1 align="center">react-native-google-maps-plus</h1>

<p align="center">
  Map and Street View components for React Native.<br />
  Uses the Google Maps SDK for iOS and the Maps SDK for Android, built on Nitro Modules.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-google-maps-plus"><img src="https://img.shields.io/npm/v/react-native-google-maps-plus.svg?logo=npm&color=cb0000" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/react-native-google-maps-plus"><img src="https://img.shields.io/npm/v/react-native-google-maps-plus/dev.svg?label=dev%20release&color=orange" alt="dev release" /></a>
  <a href="https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml"><img src="https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml/badge.svg" alt="build" /></a>
  <img src="https://img.shields.io/badge/react--native-%3E%3D0.87.0-61dafb.svg?logo=react" alt="React Native 0.87 or newer" />
</p>

<p align="center">
  <a href="https://pinpong.github.io/react-native-google-maps-plus"><b>Documentation</b></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples"><b>Examples</b></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://pinpong.github.io/react-native-google-maps-plus/docs/api"><b>API reference</b></a>
</p>

<br />

<table>
  <tr>
    <td align="center" width="20%"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/ride"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/ios/ride.webp" alt="Ride tracking: a car on its way to the drop-off" /><br /><sub><b>Ride tracking</b></sub></a></td>
    <td align="center" width="20%"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/stores"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/ios/stores.webp" alt="Store locator: coffee shop pins with a selected card" /><br /><sub><b>Store locator</b></sub></a></td>
    <td align="center" width="20%"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/transit"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/ios/transit.webp" alt="Transit network: BART and Muni lines with stations" /><br /><sub><b>Transit network</b></sub></a></td>
    <td align="center" width="20%"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/heatmap"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/ios/heatmap.webp" alt="Analytics: a heatmap on a dark map style" /><br /><sub><b>Analytics</b></sub></a></td>
    <td align="center" width="20%"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/hiking"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/ios/hiking.webp" alt="Outdoor tracking: a hike on the terrain map" /><br /><sub><b>Outdoor tracking</b></sub></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/navigation"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/android/navigation.webp" alt="Navigation: a tilted map with 3D buildings and a turn instruction" /><br /><sub><b>Navigation</b></sub></a></td>
    <td align="center"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/rentals"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/android/rentals.webp" alt="Rentals: price tags in a drawn search area" /><br /><sub><b>Rentals</b></sub></a></td>
    <td align="center"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/friends"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/android/friends.webp" alt="Friends nearby: avatar markers with names" /><br /><sub><b>Friends nearby</b></sub></a></td>
    <td align="center"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/flights"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/android/flights.webp" alt="Flight routes: geodesic routes across the Atlantic" /><br /><sub><b>Flight routes</b></sub></a></td>
    <td align="center"><a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples/use-cases/street-view"><img src="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/docs/static/img/screens/android/street-view.webp" alt="Street View at the Golden Gate Bridge" /><br /><sub><b>Street View</b></sub></a></td>
  </tr>
</table>

<p align="center"><sub>Top row on iOS, bottom row on Android. Every marker is an SVG. <a href="https://pinpong.github.io/react-native-google-maps-plus/docs/examples">25 examples with code</a>.</sub></p>

## Features

- Map view and Street View panorama
- Markers with SVG icons, rendered with [lunasvg](https://github.com/sammycage/lunasvg)
- Advanced Markers with pins and glyphs
- Polylines, polygons, circles, heatmaps, KML layers and URL tile overlays
- Map styles, map IDs, dark mode, traffic, transit and indoor maps
- Camera control and snapshots
- Location updates, heading and permissions

## Requirements

|              | Minimum                                  |
| ------------ | ---------------------------------------- |
| React Native | 0.87, New Architecture                   |
| iOS          | 16                                       |
| Android      | API 26, Kotlin 2.3                       |
| Expo         | Development build with the config plugin |

## Installation

```sh
yarn add react-native-google-maps-plus react-native-nitro-modules
```

Then set up the Google Maps SDKs and your API keys for iOS and Android, see the [installation guide](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/installation).

## Usage

```tsx
import { GoogleMapsView } from 'react-native-google-maps-plus';

export default function App() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      mapOptions={{
        camera: {
          center: { latitude: 37.7749, longitude: -122.4194 },
          zoom: 12,
        },
      }}
      markers={[
        {
          id: 'ferry-building',
          coordinate: { latitude: 37.7955, longitude: -122.3937 },
        },
      ]}
    />
  );
}
```

Overlays are props, callbacks report what the user does and the ref moves the camera. See [Usage](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/usage) and the [examples](https://pinpong.github.io/react-native-google-maps-plus/docs/examples).

## Documentation

- [Installation](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/installation)
- [Usage](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/usage)
- [Upgrading from 1.x](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/upgrading-from-1x)
- [SVG markers](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/svg-markers)
- [Advanced markers](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/advanced-markers)
- [Troubleshooting](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/troubleshooting)
- [Limitations](https://pinpong.github.io/react-native-google-maps-plus/docs/guides/limitations)
- [API reference](https://pinpong.github.io/react-native-google-maps-plus/docs/api)
- [llms.txt](https://pinpong.github.io/react-native-google-maps-plus/llms.txt) for AI tools

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Docs website](CONTRIBUTING.md#docs-website)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
