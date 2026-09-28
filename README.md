# react-native-google-maps-plus

[![npm version](https://img.shields.io/npm/v/react-native-google-maps-plus.svg?logo=npm&color=cb0000)](https://www.npmjs.com/package/react-native-google-maps-plus)
[![Dev Release](https://img.shields.io/npm/v/react-native-google-maps-plus/dev.svg?label=dev%20release&color=orange)](https://www.npmjs.com/package/react-native-google-maps-plus)
[![Build](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml/badge.svg)](https://github.com/pinpong/react-native-google-maps-plus/actions/workflows/release.yml)
[![API Docs](https://img.shields.io/static/v1?label=typedoc&message=docs&color=informational)](https://pinpong.github.io/react-native-google-maps-plus)
![React Native](https://img.shields.io/badge/react--native-%3E%3D0.87.0-61dafb.svg?logo=react)

React Native wrapper for Android & iOS Google Maps SDK with Street View support

## Documentation

- [Installation guide and API reference](https://pinpong.github.io/react-native-google-maps-plus)

## SVG markers

`iconSvg` and `infoWindowIconSvg` are rendered by [lunasvg](https://github.com/sammycage/lunasvg) on iOS and Android. What an SVG may contain and how it looks is defined by lunasvg.

- **Size:** the SVG is fitted into `width` x `height` and centered. It keeps its aspect ratio.
- **Images:** `<image>` may reference PNG, JPEG, GIF, BMP and SVG data URIs and http(s) URLs. Remote images are limited to 8 MB each and cached in memory. Provide raster images in device resolution, e.g. 192 px wide for a 64 pt marker on a 3x screen. Large photos cost a lot of memory, because every `<image>` keeps its decoded bitmap.
- **Info windows:** remote images are loaded when the marker is added. Until an image is there, its `<image>` draws nothing, so a shape placed underneath works as a placeholder.
- **Fonts:** the system fonts and the fonts bundled with the app (Android: `assets/fonts`, iOS: `UIAppFonts`). A bundled font is found by its file name without extension, e.g. `font-family="Roboto-Bold"`, and by the family it declares, e.g. `font-family="Roboto" font-weight="bold"`. Fonts registered at runtime, e.g. with `expo-font`, are not found. Text without a known `font-family` is drawn with the system font on Android and with Arial on iOS.

### Limitations

- An SVG with a `viewBox` and only one of `width` and `height` is not drawn. Set both or leave both out.

For the supported SVG features and known rendering issues see lunasvg's [feature list](https://github.com/sammycage/lunasvg#features) and [issues](https://github.com/sammycage/lunasvg/issues).

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

SVG rendering uses [lunasvg](https://github.com/sammycage/lunasvg) and [plutovg](https://github.com/sammycage/plutovg). Portions of this software are copyright © 2014 The FreeType Project (www.freetype.org). All rights reserved. Apps that ship this library have to include this notice.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
