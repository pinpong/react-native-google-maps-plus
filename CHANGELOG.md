## [1.10.2](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.10.1...v1.10.2) (2025-12-03)

### 🐛 Bug Fixes

* **android:** guard RNLocation against IllegalStateException ([4ec58a4](https://github.com/pinpong/react-native-google-maps-plus/commit/4ec58a4bcc3276da9bf0561e9430520b08e125cf))
* **android:** stabilize lifecycle handling for MapView detachment ([2172696](https://github.com/pinpong/react-native-google-maps-plus/commit/217269692a4d26cf699753e36fc731e678d3a8ad))
* **example:** mapStyle type ([94971d9](https://github.com/pinpong/react-native-google-maps-plus/commit/94971d96d08cc1e6100eba300313194bc641af57))

### 📚 Documentation

* add Typedoc and API docs (GH Pages deploy) ([8384533](https://github.com/pinpong/react-native-google-maps-plus/commit/8384533e526bd7dfabfe340ee3487d6d80e96e06))

### 🛠️ Other changes

* merge dev into main ([3f1b18d](https://github.com/pinpong/react-native-google-maps-plus/commit/3f1b18de6016399204f41293fc72ec2c92c9fe74))
* update dependencies ([1088a79](https://github.com/pinpong/react-native-google-maps-plus/commit/1088a790fbb185877a189ff9021d34e8337a3b4b))
* update dependencies ([5a3e486](https://github.com/pinpong/react-native-google-maps-plus/commit/5a3e4861861c88cf2c920ae85a953b6360460c2d))

## [1.10.1](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.10.0...v1.10.1) (2025-11-28)

### 🐛 Bug Fixes

* add safe fallback handling for marker icon rendering ([c2d83ad](https://github.com/pinpong/react-native-google-maps-plus/commit/c2d83ad57d6d2a5de0eb06182b8e9ab2872e1899))
* **android:** properly dispose mapview ([573e901](https://github.com/pinpong/react-native-google-maps-plus/commit/573e901b633a62eaa9cf349ae3b00b13b8ed9fc1))
* **android:** setCameraToCoordinates padding ([59a163c](https://github.com/pinpong/react-native-google-maps-plus/commit/59a163ce611be1e12408db1e4254cfa1a911de86))
* **ios:** prevent non-main thread UI access in map view ([f874151](https://github.com/pinpong/react-native-google-maps-plus/commit/f874151e2c855296005d639af52d67ad6c79e35c))
* **ios:** properly dispose mapview ([aaad0d2](https://github.com/pinpong/react-native-google-maps-plus/commit/aaad0d2d956aa5c0f45f354bcfa6fc6dbbcabf93))

### 🔄 Code Refactors

* **android:** showLocationDialog ([ff0e1ec](https://github.com/pinpong/react-native-google-maps-plus/commit/ff0e1ecf3a7db465a705f97f0530d59e4e01f1f9))

### 🛠️ Other changes

* **ios:** remove log ([0aae5b0](https://github.com/pinpong/react-native-google-maps-plus/commit/0aae5b0e4e535d5c082fc6e4e0c0f58ce86906ba))
* merge dev into main ([e9af3f6](https://github.com/pinpong/react-native-google-maps-plus/commit/e9af3f61fd5b8ee181eafe271881f5acb9e4cc05))

## [1.10.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.9.0...v1.10.0) (2025-11-19)

### ✨ Features

* **ios:** add location activity type support ([ddf3303](https://github.com/pinpong/react-native-google-maps-plus/commit/ddf33036386f00b7ecfd1eb588fefa868e7ecb75))

### 🐛 Bug Fixes

* **android:** forward last known location to LocationSource listener ([89884db](https://github.com/pinpong/react-native-google-maps-plus/commit/89884db59766021a1a6525a611f08ba5f2f97f56))
* **android:** isMyLocationButtonEnabled and use always custom LocationSource ([73c0659](https://github.com/pinpong/react-native-google-maps-plus/commit/73c065996fb06940d0a65ebe7ebf4ca9fdf95ef7))
* **android:** location updates now fully controlled by lifecycle ([2761229](https://github.com/pinpong/react-native-google-maps-plus/commit/2761229db7badbcfc7c4914fe998b2fa92cb2762))
* **android:** mapview onDestroy ([5afeb22](https://github.com/pinpong/react-native-google-maps-plus/commit/5afeb22daa6493ef73a902ef2f43a7966b7d954d))
* **android:** prevent same location update ([dbd13a1](https://github.com/pinpong/react-native-google-maps-plus/commit/dbd13a102d04c623edac7706b8b161bec5976f35))
* **android:** request immediate location update instead of using last known ([873c034](https://github.com/pinpong/react-native-google-maps-plus/commit/873c034a8eda9557ecfc543b437710881770bf0d))
* **example:** statusbar ([4e20d8a](https://github.com/pinpong/react-native-google-maps-plus/commit/4e20d8a376fe237daddb5c5b7b11df9a127082ea))
* **ios:** added nitromodules import to module & view impl files ([0cee1b2](https://github.com/pinpong/react-native-google-maps-plus/commit/0cee1b2144dd840a5caa47f095aa4460a9564ff4))
* **ios:** mapview deinit ([3df1eed](https://github.com/pinpong/react-native-google-maps-plus/commit/3df1eed30a21300abc4238658225b229c7b6e879))
* **ios:** request immediate location update instead of using last known ([6d15e4c](https://github.com/pinpong/react-native-google-maps-plus/commit/6d15e4c2304a2b0c686e95e00ef781dad4c2c17e))
* **ios:** traffic enabled ([f5358b7](https://github.com/pinpong/react-native-google-maps-plus/commit/f5358b72f7b2db93d02339b8580355b66ce79b05))
* trigger release ([bb7d196](https://github.com/pinpong/react-native-google-maps-plus/commit/bb7d196480e6891d1276dc65f4e79eb59d2e1e45))

### 🔄 Code Refactors

* **android:** lifecycle ([0f4cec0](https://github.com/pinpong/react-native-google-maps-plus/commit/0f4cec0dacb5b4bb9b76280ee08a41ef931109dc))
* **ios:** lifecycle ([fd8b8da](https://github.com/pinpong/react-native-google-maps-plus/commit/fd8b8da87f8d9acdd6e29301218bc8721d82cd2c))

### 🛠️ Other changes

* add dev tag script ([8f06ec0](https://github.com/pinpong/react-native-google-maps-plus/commit/8f06ec0191d86fb751f46cfcdfba1dea0943e7f1))
* **android:** remove packagingOptions ([e7af5dc](https://github.com/pinpong/react-native-google-maps-plus/commit/e7af5dccec97a7fbc2cd6b2e3e24c28d4923aa16))
* **android:** update google maps utils ([605d600](https://github.com/pinpong/react-native-google-maps-plus/commit/605d600c847a65300c4470cca2bb6959924ca417))
* **example:** add modules example ([e758ac8](https://github.com/pinpong/react-native-google-maps-plus/commit/e758ac8be10015223fcef24560932f9715dfc733))
* **example:** memoize callbacks ([b6d00e3](https://github.com/pinpong/react-native-google-maps-plus/commit/b6d00e3866317ebf74e62569b91e701f44b6799f))
* **example:** remove log ([cec18d7](https://github.com/pinpong/react-native-google-maps-plus/commit/cec18d7cc8fe7e5f26ad911deab93a86e8a6b490))
* **example:** update dependencies ([3662eb7](https://github.com/pinpong/react-native-google-maps-plus/commit/3662eb7627683e62ceb0cc258b4597c2bb52709f))
* merge dev into main ([39bc703](https://github.com/pinpong/react-native-google-maps-plus/commit/39bc703f5d9c3a9a23e9f26eb1bcff5bcbf78753))
* **refactor:** package.json ([6086de3](https://github.com/pinpong/react-native-google-maps-plus/commit/6086de398bde08eefa2fbdd18093730cbbd43abc))
* remove unused dependencies ([813dca2](https://github.com/pinpong/react-native-google-maps-plus/commit/813dca27db45b038ae12512dcb5badefe39c0d93))
* update dependencies ([a1bfca1](https://github.com/pinpong/react-native-google-maps-plus/commit/a1bfca144cdd431d2e241c0bc635a2113994cfd3))
* update dependencies ([2c89c93](https://github.com/pinpong/react-native-google-maps-plus/commit/2c89c93c7a9f2a7d996eed11a4a4fc561b13f4ed))
* update formatter style ([9ffbba2](https://github.com/pinpong/react-native-google-maps-plus/commit/9ffbba204ce938b83b7e0a16a8928969a0698d37))
* update package.json ([8d52cd9](https://github.com/pinpong/react-native-google-maps-plus/commit/8d52cd9725c4007aa15195491a072cabc8f98eb9))
* update PR template ([0f3fa22](https://github.com/pinpong/react-native-google-maps-plus/commit/0f3fa22978bb77cacbccb7d143f7c516c0627cec))
* update yarn.lock ([e951abe](https://github.com/pinpong/react-native-google-maps-plus/commit/e951abeaa427924ca0536a4651423da27ff788ee))
* updated dependencies ([b216ca4](https://github.com/pinpong/react-native-google-maps-plus/commit/b216ca4d9f841584511b8b1b4524d39cb74248bd))
* updated eslint ([5b1a898](https://github.com/pinpong/react-native-google-maps-plus/commit/5b1a89809904cb51d890355cc89b35da1a4631ea))
* updated nitro ([eea7b57](https://github.com/pinpong/react-native-google-maps-plus/commit/eea7b57303556dd2dad5758b9e4ab4f4e2efefcc))
* updated README.md ([b573d7e](https://github.com/pinpong/react-native-google-maps-plus/commit/b573d7e0297c2bf9e1fb17e26cafd794977a62ed))

## [1.8.7](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.6...v1.8.7) (2025-11-09)

### 🐛 Bug Fixes

* **android:** prevent UnsupportedOperationException in lite mode ([482c25d](https://github.com/pinpong/react-native-google-maps-plus/commit/482c25d7733b095ad5e1a9789a305a3e77c4fd87)), closes [#73](https://github.com/pinpong/react-native-google-maps-plus/issues/73)

### 🛠️ Other changes

* added SVGKit patch ([df3f401](https://github.com/pinpong/react-native-google-maps-plus/commit/df3f401161c0d9774b0f074e5fe2ad87af23e0d9))
* **example:** apply SVGKit patch ([4b3b3f7](https://github.com/pinpong/react-native-google-maps-plus/commit/4b3b3f7ca39ced08b093ef7c88df9a036b6d0dbb))
* **example:** ios build ([1b2e1f2](https://github.com/pinpong/react-native-google-maps-plus/commit/1b2e1f240e893c0a7c1bef0796ca2698e9aaf62f))
* **example:** update build script ([2efdc25](https://github.com/pinpong/react-native-google-maps-plus/commit/2efdc25bd739fce7a0f1e51d1aac7798e9d45b61))
* **example:** update Podfile ([79947e6](https://github.com/pinpong/react-native-google-maps-plus/commit/79947e64fd96b4b1f81964b8f303242db9ddb2cc))
* **example:** update Podfile ([2b4e9d9](https://github.com/pinpong/react-native-google-maps-plus/commit/2b4e9d953a06d4fc4f6fe589f2f0a073b231ba5c))
* **example:** update Podfile ([5cf5a45](https://github.com/pinpong/react-native-google-maps-plus/commit/5cf5a45fd12390c448d1c03026b3e01b9932173a))
* **example:** update Podfile ([804f9d9](https://github.com/pinpong/react-native-google-maps-plus/commit/804f9d9d1f8c878ac5f12a95fcaf821bca98161f))
* **example:** update Podfile ([31e3ace](https://github.com/pinpong/react-native-google-maps-plus/commit/31e3acedfda464cb1bbd00e81c2cc467ba1762b5))
* **example:** update Podfile ([fe26037](https://github.com/pinpong/react-native-google-maps-plus/commit/fe26037256b0c89db73745db32bdfccba38f0f5f))
* **example:** update Podfile ([3588429](https://github.com/pinpong/react-native-google-maps-plus/commit/3588429951ef23ef7c6031a37160cbdf127055a1))
* fix dev tag ([6c4cde3](https://github.com/pinpong/react-native-google-maps-plus/commit/6c4cde3c2b1bab6b0afec46db4c29249fce645b2))
* merge dev into main ([7146ef3](https://github.com/pinpong/react-native-google-maps-plus/commit/7146ef38de54cb19ed58986836056a403fc4513e))
* update dependencies ([ab05220](https://github.com/pinpong/react-native-google-maps-plus/commit/ab05220b16aedee139e5ac9ba6daedf166f376ca))

## [1.8.6](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.5...v1.8.6) (2025-11-05)

### 🐛 Bug Fixes

* **example:** styles ([606d319](https://github.com/pinpong/react-native-google-maps-plus/commit/606d3197dba6c6176517008104b36c3180f533de))
* rename user interface style default to system ([fc056e6](https://github.com/pinpong/react-native-google-maps-plus/commit/fc056e63b5e3463786200d8eb9c9c41df5bec632))

### 🛠️ Other changes

* **example:** add marker animation ([6b3d34d](https://github.com/pinpong/react-native-google-maps-plus/commit/6b3d34db4595588ef166c02c7f01009c6da973ab))
* **example:** style ([3b4fbef](https://github.com/pinpong/react-native-google-maps-plus/commit/3b4fbefc47684194c45adcf01d55b2d37fbcbad3))
* merge dev into main ([76d4289](https://github.com/pinpong/react-native-google-maps-plus/commit/76d42890437c25c27852417cefcdc697415a0588))
* update nitrogen ([995b851](https://github.com/pinpong/react-native-google-maps-plus/commit/995b8511595f4567415dd3e04fc5ebc771f6c6b5))
* update README.md ([eca2eeb](https://github.com/pinpong/react-native-google-maps-plus/commit/eca2eebc09c57df70b62ce8241e20efe0801e6e9))
* update README.md ([0ef9453](https://github.com/pinpong/react-native-google-maps-plus/commit/0ef9453695030ecece1249c73a705202fa889060))

## [1.8.5](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.4...v1.8.5) (2025-11-04)

### 🐛 Bug Fixes

* **memory:** proper low-memory cleanup & marker cache reduction ([55ce7e9](https://github.com/pinpong/react-native-google-maps-plus/commit/55ce7e9ab9d33cd650b1aab38dab3e8ba5d61d8f))

### 🛠️ Other changes

* downgrade nitro ([f2039d7](https://github.com/pinpong/react-native-google-maps-plus/commit/f2039d7e509f6129468d358e50bb7b8fb603cec3))
* downgrade nitro ([d07480a](https://github.com/pinpong/react-native-google-maps-plus/commit/d07480a534b8c0943f2d6d93831ecc26d951e4c8))
* merge dev into main ([ea68a0d](https://github.com/pinpong/react-native-google-maps-plus/commit/ea68a0d3495a030f3097b7f02649273fa13d2d57))
* updated dependencies ([4788c4c](https://github.com/pinpong/react-native-google-maps-plus/commit/4788c4c9c9ee61e68cf85257c31b2a5d180efb5d))

## [1.8.4](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.3...v1.8.4) (2025-11-02)

### 🐛 Bug Fixes

* **android:** bitmap descriptor factory not initialized ([23e8f01](https://github.com/pinpong/react-native-google-maps-plus/commit/23e8f01911363ca8021f9867583da7cec3385f55))

### 🛠️ Other changes

* merge dev into main ([3164b41](https://github.com/pinpong/react-native-google-maps-plus/commit/3164b413e91056390d7e40d556da71972794c0e1))
* merge dev into main ([d0a11b8](https://github.com/pinpong/react-native-google-maps-plus/commit/d0a11b8edf2c5ff4ec5a36cffb291c4c5f297fda))
* merge dev into main ([a66cc25](https://github.com/pinpong/react-native-google-maps-plus/commit/a66cc25656784a2e93e7198e091449065f94ee0f))
* merge dev into main ([12b7788](https://github.com/pinpong/react-native-google-maps-plus/commit/12b778827e10c5142fd5b71f5e3cba7e9bd91471))
* merge dev into main ([cb265a7](https://github.com/pinpong/react-native-google-maps-plus/commit/cb265a7651fd5e2eb792979813e4abd8de788f4d))

## [1.8.2](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.1...v1.8.2) (2025-11-02)

### 🐛 Bug Fixes

* camera event type ([51b6f08](https://github.com/pinpong/react-native-google-maps-plus/commit/51b6f0833432972c457224673ba66af7f3db55b1))

### 🛠️ Other changes

* merge dev into main ([d0a11b8](https://github.com/pinpong/react-native-google-maps-plus/commit/d0a11b8edf2c5ff4ec5a36cffb291c4c5f297fda))

## [1.8.1](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.8.0...v1.8.1) (2025-10-31)

### 🐛 Bug Fixes

* camera event type ([4066932](https://github.com/pinpong/react-native-google-maps-plus/commit/4066932183d221017a2643de76ac95e7af1ec4df))
* **ios:** correct marker build & update threading ([9508db2](https://github.com/pinpong/react-native-google-maps-plus/commit/9508db29747bac38f016a5f7986864f1fbff5c92))
* **ios:** proper MainActor handling and tracksViewChanges toggle timing ([1d8de9a](https://github.com/pinpong/react-native-google-maps-plus/commit/1d8de9a442dd8337ac8368a16a9e6f604f04b14b))

### 💨 Performance Improvements

* **ios:** optimize marker icon rendering and task cleanup ([b51b1da](https://github.com/pinpong/react-native-google-maps-plus/commit/b51b1da890f823601f1dc5f16aaff04fba6af5c1))

### 🛠️ Other changes

* merge dev into main ([a66cc25](https://github.com/pinpong/react-native-google-maps-plus/commit/a66cc25656784a2e93e7198e091449065f94ee0f))

## [1.8.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.7.0...v1.8.0) (2025-10-30)

### ✨ Features

* map background color ([ffcab9c](https://github.com/pinpong/react-native-google-maps-plus/commit/ffcab9c6fc20c4b41aecab567d2ddea1e75fe7c2))

### 🐛 Bug Fixes

* map features build and update logic ([eba6560](https://github.com/pinpong/react-native-google-maps-plus/commit/eba6560e95da48054a8b27b18fc3b883b56f8fac))

### 🔄 Code Refactors

* **example:** use wrapCallback for hybridRef assignment ([7b2cd60](https://github.com/pinpong/react-native-google-maps-plus/commit/7b2cd609ca4b23d6798171e8721826465c5e532e))
* remove unused id param from buildIconAsync ([cc00c2a](https://github.com/pinpong/react-native-google-maps-plus/commit/cc00c2ab812345e684452765b2064240ef1b99a4))

### 🛠️ Other changes

* add missing changes from last commit ([39f063f](https://github.com/pinpong/react-native-google-maps-plus/commit/39f063f8d0de5191e9a0d5c379056eb2622efd5d))
* **android:** create bitmap with device density ([4cd4c82](https://github.com/pinpong/react-native-google-maps-plus/commit/4cd4c82134b160a6c7e594c1b4617860790d3f61))
* **android:** update dependencies ([c69cffd](https://github.com/pinpong/react-native-google-maps-plus/commit/c69cffdf758a96b2336ef3514cfdc958c4616685))
* **example:** map background color ([180c372](https://github.com/pinpong/react-native-google-maps-plus/commit/180c3724ab4b24fc5a758667e19101d74efd8745))
* **example:** update ([9129005](https://github.com/pinpong/react-native-google-maps-plus/commit/91290059b0e55cf6a21efb03e2e326b3f4b73053))
* **example:** update svg marker image links ([51144e0](https://github.com/pinpong/react-native-google-maps-plus/commit/51144e0353459375087e815a51e4bf9fcc754225))
* merge dev into main ([12b7788](https://github.com/pinpong/react-native-google-maps-plus/commit/12b778827e10c5142fd5b71f5e3cba7e9bd91471))

## [1.7.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.6.2...v1.7.0) (2025-10-27)

### ✨ Features

* add consumeOnMarkerPress and consumeOnMyLocationButtonPress to RNMapUiSettings ([3c274a1](https://github.com/pinpong/react-native-google-maps-plus/commit/3c274a116eb7c1b57cbe1f407e68eda27781789b))
* add custom info window support ([66fb740](https://github.com/pinpong/react-native-google-maps-plus/commit/66fb7400d75c9b0bb290555aa794382aebf1c2b9))
* add onInfoWindowPress ([d2e0909](https://github.com/pinpong/react-native-google-maps-plus/commit/d2e0909fa81092550e14e854ece4b0e5c5149b05))
* add onMapLoaded callback ([4bd8e47](https://github.com/pinpong/react-native-google-maps-plus/commit/4bd8e4731ec3d2d8c31d73a9487ab9f1fdcaa509))
* add onMapLongPress ([b9aaa20](https://github.com/pinpong/react-native-google-maps-plus/commit/b9aaa205fa6ae055b823ff07c1f1fc8b9aaab54a))
* add onPoiPress ([875e50c](https://github.com/pinpong/react-native-google-maps-plus/commit/875e50c6cb9aaadfc2949ff266e1d478dd9a4dbc))
* add url tile overlay ([f4badbc](https://github.com/pinpong/react-native-google-maps-plus/commit/f4badbcaba99c31ce337fa12dd9caa436d0fad8c))
* **android:** add marker icon remote image support ([35544ff](https://github.com/pinpong/react-native-google-maps-plus/commit/35544ff34359c7e77e8db8362fa2c3db5a4b0b57))
* emit region and camera from onMapLoaded event ([7e0a4f1](https://github.com/pinpong/react-native-google-maps-plus/commit/7e0a4f1478622827f7a318bfdd3f64cdec442394))

### 🐛 Bug Fixes

* **android:** clear tile cache ([b7c259a](https://github.com/pinpong/react-native-google-maps-plus/commit/b7c259ac18d2ebbbb63d8ff71f4525fd2466736f))
* **android:** proguard-rules.pro ([e5240d6](https://github.com/pinpong/react-native-google-maps-plus/commit/e5240d646382dd02998c9d46cfb1db8517549fa6))
* **android:** update location config ([25517f1](https://github.com/pinpong/react-native-google-maps-plus/commit/25517f1ab4d3c9009af2d92f4ba9d61786b696c4))
* **example:** config dialog ([962ac52](https://github.com/pinpong/react-native-google-maps-plus/commit/962ac52fc7b0bb09323cd9c629a225953fba068b))
* **example:** import ([0e1ef8b](https://github.com/pinpong/react-native-google-maps-plus/commit/0e1ef8b644d88c483052778804f7bfe6fcafdab9))
* **example:** types ([fdd27c2](https://github.com/pinpong/react-native-google-maps-plus/commit/fdd27c2abd37b9e5861ee094db384ed4c5612aa5))
* **heatmap:** colorMapSize ([bcc81c7](https://github.com/pinpong/react-native-google-maps-plus/commit/bcc81c7f2698bb1b4a1f20f15ec7b49cd095e886))
* **ios:** heatmap gradient colorMapSize ([584dcea](https://github.com/pinpong/react-native-google-maps-plus/commit/584dcea17f360032d52c6a210409d0484ad31f45))
* threading issues ([7019a86](https://github.com/pinpong/react-native-google-maps-plus/commit/7019a862c074ea6f2255091e531f25cf9c82de99))

### 🔄 Code Refactors

* align RNRegion with native SDK behavior ([092993f](https://github.com/pinpong/react-native-google-maps-plus/commit/092993f483e3c4f0993b3505bb812c300afdc580))
* cleanup ([541a4e5](https://github.com/pinpong/react-native-google-maps-plus/commit/541a4e5d115e3a0ddf1fd321baf8b83816a3dd9b))

### 🛠️ Other changes

* downgrade react version ([e43bb64](https://github.com/pinpong/react-native-google-maps-plus/commit/e43bb644dd765482d6682beb8aa568c7f78f30f4))
* **example:** add svg marker examples ([cc31a7b](https://github.com/pinpong/react-native-google-maps-plus/commit/cc31a7b8e91d855dd90faf202708cdd3cbd2f841))
* **example:** enable hardwareAccelerated ([bdbed0a](https://github.com/pinpong/react-native-google-maps-plus/commit/bdbed0a2d0ff3dec3575ffc2580406718e465007))
* merge dev into main ([cb265a7](https://github.com/pinpong/react-native-google-maps-plus/commit/cb265a7651fd5e2eb792979813e4abd8de788f4d))
* sync code parity between Android and iOS ([302d359](https://github.com/pinpong/react-native-google-maps-plus/commit/302d35920800dc6201083a0c3223f2640ed16b75))
* updated dependencies ([844c652](https://github.com/pinpong/react-native-google-maps-plus/commit/844c652024c44c25867cbe1520d5a05db86c340e))
* updated package.json ([538c2c8](https://github.com/pinpong/react-native-google-maps-plus/commit/538c2c8c1d964a07d6d25515a3cdb1330b61a7a1))

## [1.6.2](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.6.1...v1.6.2) (2025-10-21)

### 🐛 Bug Fixes

* **android:** current camera getter ([6d1dbb1](https://github.com/pinpong/react-native-google-maps-plus/commit/6d1dbb1427a7153ef13716ec77b444ad52144a64))
* **android:** location crash ([a403e49](https://github.com/pinpong/react-native-google-maps-plus/commit/a403e497f78506124c4f2e40f48c7b5554349e90))
* **ios:** animation thread ([41f293e](https://github.com/pinpong/react-native-google-maps-plus/commit/41f293ebd500d269b5d3555ad09d7c6e02b6aa7f))
* setCamera without center ([4036011](https://github.com/pinpong/react-native-google-maps-plus/commit/40360117d599659a2b3c9178122ce3e739740f06))
* setCamera without center ([73c273e](https://github.com/pinpong/react-native-google-maps-plus/commit/73c273ef7887b4d3567a034ea1f6a6751e523767))
* setCamera without props ([c82ac8d](https://github.com/pinpong/react-native-google-maps-plus/commit/c82ac8def40a26e21cd8a6cc1f6ac89316518b6d))

### 🔄 Code Refactors

* **example:** base map props ([c952dd4](https://github.com/pinpong/react-native-google-maps-plus/commit/c952dd414c89eef5af14ab28a09c43b31ff5de24))

### 🛠️ Other changes

* **android:** add proguard rules ([c49120b](https://github.com/pinpong/react-native-google-maps-plus/commit/c49120bfb49ab2224495a1091595a9f087dfe309))
* merge dev into main ([63d2aa2](https://github.com/pinpong/react-native-google-maps-plus/commit/63d2aa28d818404636cba651f018cc9bd44d9991))

## [1.6.1](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.6.0...v1.6.1) (2025-10-21)

### 🐛 Bug Fixes

* **example:** clustering ([d714f43](https://github.com/pinpong/react-native-google-maps-plus/commit/d714f43512b147ffb14a91345919bf5831fc45c5))
* map camera callbacks ([35446eb](https://github.com/pinpong/react-native-google-maps-plus/commit/35446eb4fd74ebab3860030000a7e2f6e39c5bb7))
* zoomGesturesEnabled default ([df72799](https://github.com/pinpong/react-native-google-maps-plus/commit/df727990328d04994812f743763288af0921a7cd))

### 🛠️ Other changes

* **android:** simplify null checks and improve Kotlin idioms ([5f277ac](https://github.com/pinpong/react-native-google-maps-plus/commit/5f277acecc230637b3807454a1189f6836a68397))
* description wording and formatting tweaks ([ebd0582](https://github.com/pinpong/react-native-google-maps-plus/commit/ebd05827b939c1000a6c45532ef4ba7ac5766fe1))
* description wording and formatting tweaks ([1033c63](https://github.com/pinpong/react-native-google-maps-plus/commit/1033c63116c45ed196cff899fa2cc361d30aa429))
* merge dev into main ([3998306](https://github.com/pinpong/react-native-google-maps-plus/commit/3998306e1aea392de2bb2b9e2f06270894eafe7e))
* remove dependencies overrides ([fb6114f](https://github.com/pinpong/react-native-google-maps-plus/commit/fb6114fd187c2a884a14afaf7f2aa8cf35b2b8a7))
* update Podfile.lock ([badd2c8](https://github.com/pinpong/react-native-google-maps-plus/commit/badd2c885a2a3df9f360274d4415970181dfaaa7))
* update Podfile.lock ([04a1ada](https://github.com/pinpong/react-native-google-maps-plus/commit/04a1adaca7da2c9d6b2b8326ef85319faf2dc6fc))
* updated deps ([0290e15](https://github.com/pinpong/react-native-google-maps-plus/commit/0290e151d7d1068a6cebe90a4fe9febda84d2f17))
* updated deps ([b5a2643](https://github.com/pinpong/react-native-google-maps-plus/commit/b5a2643504931e9b55ce5dcf0a66696bc01ba842))

## [1.6.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.5.0...v1.6.0) (2025-10-16)

### ✨ Features

* add expo support ([3fbf01d](https://github.com/pinpong/react-native-google-maps-plus/commit/3fbf01d0ea505bfd8a8d2e657cfc6fa953ee8443))

### 🛠️ Other changes

* add @expo/config-plugins ([d66534f](https://github.com/pinpong/react-native-google-maps-plus/commit/d66534fa31262fc06c2a3cee07f964a23e43a1f2))
* merge dev into main ([d3bbcfe](https://github.com/pinpong/react-native-google-maps-plus/commit/d3bbcfeaadfc71de1c4e898f802587faa4adea57))
* updated deps ([743b18a](https://github.com/pinpong/react-native-google-maps-plus/commit/743b18a29234a9fc08b7b041991630e6bd1a76e5))

## [1.5.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.4.1...v1.5.0) (2025-10-15)

### ✨ Features

* extend location type ([27ff058](https://github.com/pinpong/react-native-google-maps-plus/commit/27ff05869166c2c2314732a00e133af5ba7f3d93))

### 🐛 Bug Fixes

* **android:** clearHeatmaps ([a7e113a](https://github.com/pinpong/react-native-google-maps-plus/commit/a7e113a657a115911aeebebd0950ebbe5c31328d))
* **build:** copy ViewConfig.json into lib during patch step ([192e97b](https://github.com/pinpong/react-native-google-maps-plus/commit/192e97b6ab34e4a55ae46a5232cc1b61a73c1c7d))
* **example:** number input ([0d99720](https://github.com/pinpong/react-native-google-maps-plus/commit/0d997200730951b30b48af499d682e5c2aebc8f6))

### 🔄 Code Refactors

* add more extensions ([6ce8c9d](https://github.com/pinpong/react-native-google-maps-plus/commit/6ce8c9d051ee15de3deb1198e8eb748fd40d4dea))
* add more extensions ([db28521](https://github.com/pinpong/react-native-google-maps-plus/commit/db28521969ab54c033f1fafb335e1204253ac535))
* **ios:** replace DispatchQueue with Swift concurrency and release SVGKit memory ([d9b2416](https://github.com/pinpong/react-native-google-maps-plus/commit/d9b24167cc1aafafef974194025205a66f3a2653))

### 🛠️ Other changes

* fmt ([1c67f3c](https://github.com/pinpong/react-native-google-maps-plus/commit/1c67f3ca150275d9090cdcafb045e8dc51aec3d4))
* **ios:** fmt ([7974c09](https://github.com/pinpong/react-native-google-maps-plus/commit/7974c094df34ddfedbc943c22d2a856e571ad7bd))
* merge dev into main ([daed74b](https://github.com/pinpong/react-native-google-maps-plus/commit/daed74ba5c5f391acd6b69f245f51ce93952e98f))
* update example ([19559e3](https://github.com/pinpong/react-native-google-maps-plus/commit/19559e3d398e9c5722f69bb218bfa59e6efa4dfc))
* update example ([1c54d21](https://github.com/pinpong/react-native-google-maps-plus/commit/1c54d21f08914db435775ad67f95342fe036aac1))
* update release config ([eecb73e](https://github.com/pinpong/react-native-google-maps-plus/commit/eecb73e7cd8bdaa9b265e4e59ac342fcc974ecf6))

## [1.4.1](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.4.0...v1.4.1) (2025-10-13)

### 🐛 Bug Fixes

* handle feature type comparison correctly ([06528dd](https://github.com/pinpong/react-native-google-maps-plus/commit/06528dd5d3efad5b19df1dafb80bad7c96f32987))
* **ios:** marker opacity ([25c1b52](https://github.com/pinpong/react-native-google-maps-plus/commit/25c1b5264a86288c74334377ada5bb6eb62e075d))

### 🛠️ Other changes

* **example:** add clustering example ([a435508](https://github.com/pinpong/react-native-google-maps-plus/commit/a4355083215a440a1863cd045c61cf771c47f761))
* merge dev into main ([b65cabf](https://github.com/pinpong/react-native-google-maps-plus/commit/b65cabfcedd27f5add10039833e82eac3f1fc4c8))

## [1.4.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.3.0...v1.4.0) (2025-10-12)

### ✨ Features

* add polygon holes support ([36a1291](https://github.com/pinpong/react-native-google-maps-plus/commit/36a1291b054c86309e4cc8a35e08556dc7757d4c))
* add polygon holes support ([ae53e17](https://github.com/pinpong/react-native-google-maps-plus/commit/ae53e17d3d65aedfeedb34d613ca6adc8887b34a))
* add polygon holes support ([1b1d80d](https://github.com/pinpong/react-native-google-maps-plus/commit/1b1d80d15a86021a295cea5ddd3ce4fcbf09f9ff))

### 🐛 Bug Fixes

* marker, polyline, polygon and circle update ([767ecc7](https://github.com/pinpong/react-native-google-maps-plus/commit/767ecc762d5c1c6cda356b0fa3b5fede396dcbf7))

### 🛠️ Other changes

* merge dev into main ([2b076f1](https://github.com/pinpong/react-native-google-maps-plus/commit/2b076f160282581145ab1b8d55b1db769e0f7221))
* update release.config.cjs ([efdabe0](https://github.com/pinpong/react-native-google-maps-plus/commit/efdabe06afebd6016195512c75586a8e5af3b5af))

## [1.3.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.2.0...v1.3.0) (2025-10-11)

### ✨ Features

* add indoor building focus and level activation listener support ([64073d4](https://github.com/pinpong/react-native-google-maps-plus/commit/64073d432d48a8898282c246385b7a5ee7843080))
* add marker drag support ([51044c8](https://github.com/pinpong/react-native-google-maps-plus/commit/51044c8c1e53434a4513d1907965d3bc9a5359ee))
* add more supported marker props ([6b177a4](https://github.com/pinpong/react-native-google-maps-plus/commit/6b177a49c853197afa28302de3f047c46f778afc))
* add snapshot function ([b6c1281](https://github.com/pinpong/react-native-google-maps-plus/commit/b6c1281a949edd423e09430ab1a80c4822d6bd97))
* snapshot feature ([6525195](https://github.com/pinpong/react-native-google-maps-plus/commit/652519534a7c2a0d9dc16acce3d803f55575f96d))
* snapshot feature ([7fe037a](https://github.com/pinpong/react-native-google-maps-plus/commit/7fe037ace3fc9f9413eeb69ab94595072e084c8c))

### 🐛 Bug Fixes

* disable ios view recycling ([46813b8](https://github.com/pinpong/react-native-google-maps-plus/commit/46813b8d7aec265264038f0dd45d4cc242f42d57))
* map initialization ([0370ddf](https://github.com/pinpong/react-native-google-maps-plus/commit/0370ddfc113f4d414c212f28fcfc744fa38c9130))
* mapview onDestroy ([f1110e7](https://github.com/pinpong/react-native-google-maps-plus/commit/f1110e728cbf89bd3fac74b0ab83409776925943))

### 🔄 Code Refactors

* map initialization ([150a526](https://github.com/pinpong/react-native-google-maps-plus/commit/150a52640f9ec79a108c9c4aa69bdecd5831dece))

### 🛠️ Other changes

* **example:** update example ([0320a78](https://github.com/pinpong/react-native-google-maps-plus/commit/0320a78967f21ec05835b5d3b7a18ac0c59d649d))
* merge dev into main ([d9768d6](https://github.com/pinpong/react-native-google-maps-plus/commit/d9768d6b5f2e09a754dc606a1fa690fbdec30a94))
* update CHANGELOG.md ([f2b897d](https://github.com/pinpong/react-native-google-maps-plus/commit/f2b897dbe2ac1b94262519cebe58f0b4e13a88b1))

## [1.2.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.1.0...v1.2.0) (2025-10-09)

### ✨ Features

* add kml layer support ([4faf558](https://github.com/pinpong/react-native-google-maps-plus/commit/4faf558425831cc18a6e9c9e2d20ef0c4f42e702))
* add kml layer support ([35098bd](https://github.com/pinpong/react-native-google-maps-plus/commit/35098bd4c75b825f96f58696cbb37a4fcdebbdb8))

### 🐛 Bug Fixes

* **example:** build issues ([cee0708](https://github.com/pinpong/react-native-google-maps-plus/commit/cee0708dfdee185ee4c8bb2836abd2a3c022fc93))

### 🛠️ Other changes

* **ci:** move PR template to root for auto-apply ([03e8a84](https://github.com/pinpong/react-native-google-maps-plus/commit/03e8a8438b0d5edab80fcdf2f2c8abf3372288c2))
* **example:** beautify example app UI ([4f390ec](https://github.com/pinpong/react-native-google-maps-plus/commit/4f390ecd9ebc2f3e559913882ac56d33a30ac45b))
* **example:** beautify example app UI ([73c997c](https://github.com/pinpong/react-native-google-maps-plus/commit/73c997c69f23deeb48eb9b2be5df76a36ff0afea))
* fix CHANGELOG.md ([2f2bb2c](https://github.com/pinpong/react-native-google-maps-plus/commit/2f2bb2c617260166551abbc07dfa9a8ae27cf31e))
* merge dev into main ([a510e2a](https://github.com/pinpong/react-native-google-maps-plus/commit/a510e2a1bebabde03e319256b2a1246f10ce1b95))

## [1.1.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.0.2...v1.1.0) (2025-10-08)

### ✨ Features

* add heatmap support ([ddcfccf](https://github.com/pinpong/react-native-google-maps-plus/commit/ddcfccf4cbb08b2756c20ca7215a8fe45e30befb))
* add heatmap support ([96a3a08](https://github.com/pinpong/react-native-google-maps-plus/commit/96a3a08696e38f77db356d9e0e71a6e6b98a589f))
* add map ui settings support ([7921f49](https://github.com/pinpong/react-native-google-maps-plus/commit/7921f4941f6656fe9c588d4f5e9d1f5594632598))
* add mapCircle support ([8e32d14](https://github.com/pinpong/react-native-google-maps-plus/commit/8e32d14ae6d3e8254a46ffbb19fd3eb26575f46d))
* add mapId support ([75f73fa](https://github.com/pinpong/react-native-google-maps-plus/commit/75f73fac949f8e2a5112e1456226e60de8540474))
* add mapType ([754df51](https://github.com/pinpong/react-native-google-maps-plus/commit/754df51a8819ce5475d29262bbf95d8f0586393f))
* add mapType ([300614f](https://github.com/pinpong/react-native-google-maps-plus/commit/300614f22419f166c2482025f66b761145e75394))
* add mapType ([e32a3f5](https://github.com/pinpong/react-native-google-maps-plus/commit/e32a3f59fc1128b6a4c295d4e5d74d8afa7aa3cd))
* more map features ([796be0b](https://github.com/pinpong/react-native-google-maps-plus/commit/796be0b0976926f72b5d95b1ba5d2406988f4d9e))
* optional marker svg ([d9bd19d](https://github.com/pinpong/react-native-google-maps-plus/commit/d9bd19d72916ec697acc9cecc58219a3df8c5d54))
* optional marker svg ([#30](https://github.com/pinpong/react-native-google-maps-plus/issues/30)) ([5f8852c](https://github.com/pinpong/react-native-google-maps-plus/commit/5f8852c85741b75959f1d1e16240704cca042bb5))

### 🐛 Bug Fixes

* add ios privacy manifest ([175bfdf](https://github.com/pinpong/react-native-google-maps-plus/commit/175bfdf0a932aa7dcc789ac9287eb2e91a9d0bf6))
* add ios privacy manifest ([#31](https://github.com/pinpong/react-native-google-maps-plus/issues/31)) ([acc394e](https://github.com/pinpong/react-native-google-maps-plus/commit/acc394e49ca5bc9eaa5e67942fd2ed645dc2332c))
* dev package version ([ab9b581](https://github.com/pinpong/react-native-google-maps-plus/commit/ab9b581e7f571d09ffbe597cf8834234b43ee3a1))
* dev package version ([1317f23](https://github.com/pinpong/react-native-google-maps-plus/commit/1317f234d832a623c6e5dbce4dafd9154da73857))
* **example:** update Podfile.lock ([0eb9a09](https://github.com/pinpong/react-native-google-maps-plus/commit/0eb9a09bca8b13241b13851c4af0857545284229))

### 🔄 Code Refactors

* **map:** unify update logic and defaults across Android and iOS ([cdaa01a](https://github.com/pinpong/react-native-google-maps-plus/commit/cdaa01af77ae93f9e9652dd018fe18f0ca6309b4))
* **map:** unify update logic and defaults across Android and iOS ([f15d638](https://github.com/pinpong/react-native-google-maps-plus/commit/f15d6388911943b5abdfd9d5f61e3423af33f064))
* nitrogen-patch.js ([20fbb0d](https://github.com/pinpong/react-native-google-maps-plus/commit/20fbb0d7bea58bd54ade53119dc510d0ce9b18f9))
* optional props ([9faa702](https://github.com/pinpong/react-native-google-maps-plus/commit/9faa7024c2bea0818734cb5831b93c4d360da0bd))

### 📚 Documentation

* **readme:** update setup instructions ([9f88702](https://github.com/pinpong/react-native-google-maps-plus/commit/9f88702b187fde5c2e3d852f1d0aeeac48f8222b))

### 🛠️ Other changes

* add dev badge ([c8660b7](https://github.com/pinpong/react-native-google-maps-plus/commit/c8660b75581f447953fba6c9ec440146fcf8f48d))
* merge dev into main ([f851047](https://github.com/pinpong/react-native-google-maps-plus/commit/f8510472835ad5a861341652c6541477df205508))
* update .gitignore ([c15be5e](https://github.com/pinpong/react-native-google-maps-plus/commit/c15be5eb436d05f1f5a25fe7c8249e7c23eea3b2))
* update to react-native 0.82.0 ([31d5ff5](https://github.com/pinpong/react-native-google-maps-plus/commit/31d5ff5157ec8357b9d699d4dcc09bda09e11afb))
* update to react-native 0.82.0 ([8c8e8ae](https://github.com/pinpong/react-native-google-maps-plus/commit/8c8e8ae1c4fcf97e04059d873461f083e4c346cf))

## [1.1.0](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.0.2...v1.1.0) (2025-10-08)

### ✨ Features

* add heatmap support ([ddcfccf](https://github.com/pinpong/react-native-google-maps-plus/commit/ddcfccf4cbb08b2756c20ca7215a8fe45e30befb))
* add heatmap support ([96a3a08](https://github.com/pinpong/react-native-google-maps-plus/commit/96a3a08696e38f77db356d9e0e71a6e6b98a589f))
* add map ui settings support ([7921f49](https://github.com/pinpong/react-native-google-maps-plus/commit/7921f4941f6656fe9c588d4f5e9d1f5594632598))
* add mapCircle support ([8e32d14](https://github.com/pinpong/react-native-google-maps-plus/commit/8e32d14ae6d3e8254a46ffbb19fd3eb26575f46d))
* add mapId support ([75f73fa](https://github.com/pinpong/react-native-google-maps-plus/commit/75f73fac949f8e2a5112e1456226e60de8540474))
* add mapType ([754df51](https://github.com/pinpong/react-native-google-maps-plus/commit/754df51a8819ce5475d29262bbf95d8f0586393f))
* add mapType ([300614f](https://github.com/pinpong/react-native-google-maps-plus/commit/300614f22419f166c2482025f66b761145e75394))
* add mapType ([e32a3f5](https://github.com/pinpong/react-native-google-maps-plus/commit/e32a3f59fc1128b6a4c295d4e5d74d8afa7aa3cd))
* more map features ([796be0b](https://github.com/pinpong/react-native-google-maps-plus/commit/796be0b0976926f72b5d95b1ba5d2406988f4d9e))
* optional marker svg ([d9bd19d](https://github.com/pinpong/react-native-google-maps-plus/commit/d9bd19d72916ec697acc9cecc58219a3df8c5d54))
* optional marker svg ([#30](https://github.com/pinpong/react-native-google-maps-plus/issues/30)) ([5f8852c](https://github.com/pinpong/react-native-google-maps-plus/commit/5f8852c85741b75959f1d1e16240704cca042bb5))

### 🐛 Bug Fixes

* add ios privacy manifest ([175bfdf](https://github.com/pinpong/react-native-google-maps-plus/commit/175bfdf0a932aa7dcc789ac9287eb2e91a9d0bf6))
* add ios privacy manifest ([#31](https://github.com/pinpong/react-native-google-maps-plus/issues/31)) ([acc394e](https://github.com/pinpong/react-native-google-maps-plus/commit/acc394e49ca5bc9eaa5e67942fd2ed645dc2332c))
* dev package version ([ab9b581](https://github.com/pinpong/react-native-google-maps-plus/commit/ab9b581e7f571d09ffbe597cf8834234b43ee3a1))
* dev package version ([1317f23](https://github.com/pinpong/react-native-google-maps-plus/commit/1317f234d832a623c6e5dbce4dafd9154da73857))
* **example:** update Podfile.lock ([0eb9a09](https://github.com/pinpong/react-native-google-maps-plus/commit/0eb9a09bca8b13241b13851c4af0857545284229))

### 🔄 Code Refactors

* **map:** unify update logic and defaults across Android and iOS ([cdaa01a](https://github.com/pinpong/react-native-google-maps-plus/commit/cdaa01af77ae93f9e9652dd018fe18f0ca6309b4))
* **map:** unify update logic and defaults across Android and iOS ([f15d638](https://github.com/pinpong/react-native-google-maps-plus/commit/f15d6388911943b5abdfd9d5f61e3423af33f064))
* nitrogen-patch.js ([20fbb0d](https://github.com/pinpong/react-native-google-maps-plus/commit/20fbb0d7bea58bd54ade53119dc510d0ce9b18f9))
* optional props ([9faa702](https://github.com/pinpong/react-native-google-maps-plus/commit/9faa7024c2bea0818734cb5831b93c4d360da0bd))

### 📚 Documentation

* **readme:** update setup instructions ([9f88702](https://github.com/pinpong/react-native-google-maps-plus/commit/9f88702b187fde5c2e3d852f1d0aeeac48f8222b))

### 🛠️ Other changes

* add dev badge ([c8660b7](https://github.com/pinpong/react-native-google-maps-plus/commit/c8660b75581f447953fba6c9ec440146fcf8f48d))
* merge dev into main ([f851047](https://github.com/pinpong/react-native-google-maps-plus/commit/f8510472835ad5a861341652c6541477df205508))
* update .gitignore ([c15be5e](https://github.com/pinpong/react-native-google-maps-plus/commit/c15be5eb436d05f1f5a25fe7c8249e7c23eea3b2))
* update to react-native 0.82.0 ([31d5ff5](https://github.com/pinpong/react-native-google-maps-plus/commit/31d5ff5157ec8357b9d699d4dcc09bda09e11afb))
* update to react-native 0.82.0 ([8c8e8ae](https://github.com/pinpong/react-native-google-maps-plus/commit/8c8e8ae1c4fcf97e04059d873461f083e4c346cf))
* ## [1.0.2](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.0.1...v1.0.2) (2025-10-02)

### 🐛 Bug Fixes

* build script ([d1f11f2](https://github.com/pinpong/react-native-google-maps-plus/commit/d1f11f237900f929689b72dfb41054dac0790a37))
* build script ([98e194e](https://github.com/pinpong/react-native-google-maps-plus/commit/98e194e61d08af96ce75e156a6f5e3a5378c1b4c))
* name conflict ([faf8d5e](https://github.com/pinpong/react-native-google-maps-plus/commit/faf8d5e7a0f79bfceb8454510e8e5ad3771fdbd2))
* name conflict ([7217c11](https://github.com/pinpong/react-native-google-maps-plus/commit/7217c113bc2e5742bbc4b119eec7672c0b240cba))
* react type ([36e22d5](https://github.com/pinpong/react-native-google-maps-plus/commit/36e22d59f0746ad9759799465eefed8f66a19049))

## [1.0.1](https://github.com/pinpong/react-native-google-maps-plus/compare/v1.0.0...v1.0.1) (2025-10-02)

### 🐛 Bug Fixes

* release ([afbb9cd](https://github.com/pinpong/react-native-google-maps-plus/commit/afbb9cdf0261c35fcd4c6423096fbecaa482f704))
* release ([#18](https://github.com/pinpong/react-native-google-maps-plus/issues/18)) ([b271ccc](https://github.com/pinpong/react-native-google-maps-plus/commit/b271ccc69f9cb3e48c865801bdd104fd6065b557))

### 🛠️ Other changes

* format ([e67d939](https://github.com/pinpong/react-native-google-maps-plus/commit/e67d939e23a8db82432334c767f780ebe2320d6c))

## 1.0.0 (2025-10-02)

### 🐛 Bug Fixes

* set npm publish to true ([ed7544b](https://github.com/pinpong/react-native-google-maps-plus/commit/ed7544b5c0b39cec418a83842e215253ac7b6eef))

### 📚 Documentation

* update README.md ([60936c9](https://github.com/pinpong/react-native-google-maps-plus/commit/60936c9351f95e590b779883d161aad1272f4a1b))
* update README.md ([00d3f65](https://github.com/pinpong/react-native-google-maps-plus/commit/00d3f656679415a8105fff2ae52fd0bd3106e472))
* update README.md ([7354d38](https://github.com/pinpong/react-native-google-maps-plus/commit/7354d3822298b75ad28024f5488cc25e70891b9c))
* update README.md ([bb2bf47](https://github.com/pinpong/react-native-google-maps-plus/commit/bb2bf47d7b273e1dd02a44425713ebe7c9bfb612))

### 🛠️ Other changes

* initial commit ([d240a87](https://github.com/pinpong/react-native-google-maps-plus/commit/d240a870fa08e5a01ef8b3e981f7e78c7e113fef))
