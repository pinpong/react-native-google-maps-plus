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
  )
  # Force iOS 16+ to avoid deployment target warnings
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
    end
  end

  # --- SVGKit Patch ---
  require 'fileutils'
  svgkit_path = File.join(installer.sandbox.pod_dir('SVGKit'), 'Source')

  # node fix
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "Node.h"', '#import "SVGKit/Node.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
    # puts "Patched Node import in: #{file}"
  end

  # import CSSValue.h
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "CSSValue.h"', '#import "SVGKit/CSSValue.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
    # puts "Patched CSSValue import in: #{file}"
  end

  # import SVGLength.h
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "SVGLength.h"', '#import "SVGKit/SVGLength.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
    # puts "Patched SVGLength import in: #{file}"
  end
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

---

### iOS

**Note:** These instructions apply to **bare React Native apps only**.
Expo projects should use the config plugin instead (see Expo section above).

See the official [Google Maps iOS SDK configuration guide](https://developers.google.com/maps/documentation/ios-sdk/config#get-key) for more details.

---

# Dependencies

This package builds on native libraries for SVG rendering and Google Maps integration:

- **iOS**: [SVGKit](https://github.com/SVGKit/SVGKit)
- **Android**: [AndroidSVG](https://bigbadaboom.github.io/androidsvg/)
- **iOS Maps SDK**: [Google Maps SDK for iOS](https://developers.google.com/maps/documentation/ios-sdk)
- **Android Maps SDK**: [Google Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk)
- **Maps Utility Libraries**: [Google Maps Utils for iOS](https://developers.google.com/maps/documentation/ios-sdk/utility) and [Google Maps Utils for Android](https://developers.google.com/maps/documentation/android-sdk/utility)

These are automatically linked when you install the package, but you may need to clean/rebuild your native projects after first install.

## Usage

Checkout the example app in the [example](./example) folder.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
