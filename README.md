# react-native-google-maps-plus

[![npm version](https://img.shields.io/npm/v/react-native-google-maps-plus.svg?logo=npm&color=cb0000)](https://www.npmjs.com/package/react-native-google-maps-plus)
[![Dev Release](https://img.shields.io/npm/v/react-native-google-maps-plus/dev.svg?label=dev%20release&color=orange)](https://www.npmjs.com/package/react-native-google-maps-plus)
[![Build](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml/badge.svg)](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml)
![React Native](https://img.shields.io/badge/react--native-%3E%3D0.81.0-61dafb.svg?logo=react)
![Platform: Android](https://img.shields.io/badge/android-supported-brightgreen.svg?logo=android&logoColor=white)
![Platform: iOS](https://img.shields.io/badge/ios-supported-lightgrey.svg?logo=apple&logoColor=black)

React Native wrapper for Android & iOS Google Maps SDK.

## Installation

`react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).

```sh
yarn add react-native-google-maps-plus react-native-nitro-modules
```

**iOS**

Add this to your Podfile only for bare React Native apps.
(Not required for Expo, handled by the config plugin.)

```ruby
post_install do |installer|
  react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      # :ccache_enabled => true
    )

  require_relative '../node_modules/react-native-google-maps-plus/scripts/svgkit_patch'
  apply_svgkit_patch(installer)
end
```

### Expo Projects

Add your keys to the `app.json`.
The config plugin automatically injects them into your native Android and iOS builds during `expo prebuild`.

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-maps-plus",
        {
          "googleMapsAndroidApiKey": "YOUR_ANDROID_MAPS_API_KEY",
          "googleMapsIosApiKey": "YOUR_IOS_MAPS_API_KEY"
        }
      ]
    ]
  }
}
```

## Setup API Key

You will need a valid **Google Maps API Key** from the [Google Cloud Console](https://console.cloud.google.com/).

### Android

**Note:** These instructions apply to **bare React Native apps only**.
Expo projects should use the config plugin instead (see Expo section above).

See the official [Google Maps Android SDK configuration guide](https://developers.google.com/maps/documentation/android-sdk/config#step_3_add_your_api_key_to_the_project) for more details.

### iOS

**Note:** These instructions apply to **bare React Native apps only**.
Expo projects should use the config plugin instead (see Expo section above).

See the official [Google Maps iOS SDK configuration guide](https://developers.google.com/maps/documentation/ios-sdk/config#get-key) for more details.

## Dependencies & Native Documentation

This package is React Native wrapper around the official Google Maps SDKs.
For full API behavior, configuration options, and feature reference, please consult the native documentation:

- **iOS Google Maps SDK**
  https://developers.google.com/maps/documentation/ios-sdk

- **Android Google Maps SDK**
  https://developers.google.com/maps/documentation/android-sdk

- **Maps Utility Libraries (iOS & Android)**
  https://developers.google.com/maps/documentation/ios-sdk/utility
  https://developers.google.com/maps/documentation/android-sdk/utility

- **SVG Rendering** (used for custom marker icons)
  - iOS: https://github.com/SVGKit/SVGKit
  - Android: https://bigbadaboom.github.io/androidsvg/

These libraries are automatically linked during installation.
If you encounter build issues, try cleaning and rebuilding your native project.

> **Note:** This package follows the native SDKs closely. Props and behavior match the underlying Google Maps APIs whenever possible.

## Usage

Basic map:

```tsx
import React from 'react';
import { GoogleMapsView } from 'react-native-google-maps-plus';

export default function App() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      initialProps={{
        camera: {
          center: { latitude: 37.7749, longitude: -122.4194 },
          zoom: 12,
        },
      }}
      markers={[
        {
          id: '1',
          zIndex: 1,
          coordinate: { latitude: 37.7749, longitude: -122.4194 },
        },
      ]}
    />
  );
}
```

Check out the example app in the [example](./example) folder.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
