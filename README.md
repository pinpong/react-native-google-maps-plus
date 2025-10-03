# react-native-google-maps-plus

[![npm version](https://img.shields.io/npm/v/react-native-google-maps-plus.svg)](https://www.npmjs.com/package/react-native-google-maps-plus)
[![Release](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml/badge.svg)](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml)
[![Issues](https://img.shields.io/github/issues/pinpong/react-native-google-maps-plus)](https://github.com/pinpong/react-native-google-maps-plus/issues)
[![License](https://img.shields.io/github/license/pinpong/react-native-google-maps-plus)](./LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Lint](https://img.shields.io/badge/lint-eslint-green.svg)](https://eslint.org/)
[![React Native](https://img.shields.io/badge/react--native-%3E%3D0.81.0-61dafb.svg)](https://reactnative.dev/)
[![Platform: Android](https://img.shields.io/badge/platform-android-green.svg)](https://developer.android.com/)
[![Platform: iOS](https://img.shields.io/badge/platform-iOS-lightgrey.svg)](https://developer.apple.com/ios/)

React-native wrapper for android & IOS google maps sdk

## Installation

`react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).

```sh
yarn add react-native-google-maps-plus react-native-nitro-modules
```

Dependencies

This package builds on native SVG rendering libraries:

iOS: [SVGKit](https://github.com/SVGKit/SVGKit)

Android: [AndroidSVG](https://bigbadaboom.github.io/androidsvg/)

These are automatically linked when you install the package, but you may need to clean/rebuild your native projects after first install.

## Setup API Key

You will need a valid **Google Maps API Key** from the [Google Cloud Console](https://console.cloud.google.com/).

### Android

It's recommend to use [Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin) to securely manage your Google Maps API Key.

---

### iOS

See the official [Google Maps iOS SDK configuration guide](https://developers.google.com/maps/documentation/ios-sdk/config#get-key) for more details.

1. Create a `Secrets.xcconfig` file inside the **ios/** folder:

   ```properties
   MAPS_API_KEY=YOUR_IOS_MAPS_API_KEY
   ```

   Include it in your project configuration file:

   ```xcconfig
   #include? "Secrets.xcconfig"
   ```

2. Reference the API key in your **Info.plist**:

   ```xml
   <key>MAPS_API_KEY</key>
   <string>$(MAPS_API_KEY)</string>
   ```

3. Provide the key programmatically in **AppDelegate.swift**:

   ```swift
   import GoogleMaps

   @UIApplicationMain
   class AppDelegate: UIResponder, UIApplicationDelegate {
     func application(_ application: UIApplication,
                      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       if let apiKey = Bundle.main.object(forInfoDictionaryKey: "MAPS_API_KEY") as? String {
           GMSServices.provideAPIKey(apiKey)
       }
       return true
     }
   }
   ```

---

## Usage

Checkout the example app in the [example](./example) folder.

# Troubleshooting

## Android

- **API key not found**
  Make sure `secrets.properties` exists under `android/` and contains your `MAPS_API_KEY`.
  Run `./gradlew clean` and rebuild.

## iOS

- **`GMSServices must be configured before use`**
  Ensure your key is in `Info.plist` and/or provided via `GMSServices.provideAPIKey(...)` in `AppDelegate.swift`.

- **Build fails with `Node.h` import error from SVGKit**
  SVGKit uses a header `Node.h` which can conflict with iOS system headers.
  You can patch it automatically in your **Podfile** inside the `post_install` hook:

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

    # Patch SVGKit includes to avoid Node.h conflicts
    require 'fileutils'
    svgkit_path = File.join(installer.sandbox.pod_dir('SVGKit'), 'Source')
    Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
      FileUtils.chmod("u+w", file)
      text = File.read(file)
      new_contents = text.gsub('#import "Node.h"', '#import "SVGKit/Node.h"')
      File.open(file, 'w') { |f| f.write(new_contents) }
    end
  end
  ```

  After applying this, run:

  ```sh
  cd ios && pod install --repo-update
  ```

- **Maps not rendering**
  - Check that your API key has **Maps SDK for Android/iOS** enabled in Google Cloud Console.
  - Make sure the key is not restricted to wrong bundle IDs or SHA1 fingerprints.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
