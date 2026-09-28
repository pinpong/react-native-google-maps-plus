require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNGoogleMapsPlus"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => 16.0 }
  s.source       = { :git => "https://github.com/pinpong/react-native-google-maps-plus.git", :tag => "#{s.version}", :submodules => true }

  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{h,m,mm}",
    "cpp/svg/*.{h,c,cpp}",
    "cpp/third_party/lunasvg/{include,source}/*.{h,cpp}",
    "cpp/third_party/lunasvg/plutovg/{include,source}/*.{h,c}",
  ]

  s.exclude_files = "cpp/third_party/lunasvg/plutovg/source/plutovg-font.c"

  unless File.exist?(File.join(__dir__, "cpp/third_party/lunasvg/include/lunasvg.h"))
    raise "[RNGoogleMapsPlus] lunasvg sources are missing. In a git checkout run `git submodule update --init`, otherwise install the package from npm."
  end

  s.public_header_files = ["cpp/svg/RNSvgRasterizer.h"]

  lunasvg_dir = "$(PODS_TARGET_SRCROOT)/cpp/third_party/lunasvg"
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "$(inherited) \"$(PODS_TARGET_SRCROOT)/cpp/svg/compat\" \"#{lunasvg_dir}/include\" \"#{lunasvg_dir}/source\" \"#{lunasvg_dir}/plutovg/include\"",
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) LUNASVG_BUILD LUNASVG_BUILD_STATIC PLUTOVG_BUILD PLUTOVG_BUILD_STATIC LUNASVG_DISABLE_EXTERNAL_RESOURCES",
    "GCC_C_LANGUAGE_STANDARD" => "gnu11",
    "GCC_OPTIMIZATION_LEVEL" => "2",
  }

  s.resource_bundles = {'RNGoogleMapsPlusPrivacy' => ['ios/Resources/PrivacyInfo.xcprivacy']}

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  spm_dependency(s,
    url: 'https://github.com/googlemaps/ios-maps-sdk',
    requirement: { kind: 'exactVersion', version: '10.15.0' },
    products: ['GoogleMaps']
  )
  spm_dependency(s,
    url: 'https://github.com/googlemaps/google-maps-ios-utils',
    requirement: { kind: 'exactVersion', version: '7.0.0' },
    products: ['GoogleMapsUtils']
  )

  load 'nitrogen/generated/ios/RNGoogleMapsPlus+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
