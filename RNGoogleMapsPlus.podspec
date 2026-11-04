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

  # HarfBuzz and SheenBidi shape the text of SVG markers, RNGOOGLEMAPSPLUS_SVG_TEXT_SHAPING=0 turns text shaping off
  svg_text_shaping = ENV["RNGOOGLEMAPSPLUS_SVG_TEXT_SHAPING"] != "0"
  text_shaping_sources = ["cpp/svg/RNSvgHarfBuzz.cc", "cpp/third_party/SheenBidi/Source/SheenBidi.c"]

  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{h,m,mm}",
    "cpp/svg/*.{h,c,cpp}",
    "cpp/third_party/lunasvg/{include,source}/*.{h,cpp}",
    "cpp/third_party/lunasvg/plutovg/{include,source}/*.{h,c}",
  ] + (svg_text_shaping ? text_shaping_sources : [])

  s.exclude_files = "cpp/third_party/lunasvg/plutovg/source/plutovg-font.c"

  third_party_sources = ["cpp/third_party/harfbuzz/src/harfbuzz.cc", "cpp/third_party/SheenBidi/Source/SheenBidi.c"]
  (["cpp/third_party/lunasvg/include/lunasvg.h"] + (svg_text_shaping ? third_party_sources : [])).each do |file|
    unless File.exist?(File.join(__dir__, file))
      raise "[RNGoogleMapsPlus] lunasvg, HarfBuzz or SheenBidi sources are missing. In a git checkout run `git submodule update --init`, otherwise install the package from npm."
    end
  end

  s.public_header_files = ["cpp/svg/RNSvgRasterizer.h"]

  third_party_dir = "$(PODS_TARGET_SRCROOT)/cpp/third_party"
  lunasvg_dir = "#{third_party_dir}/lunasvg"
  text_shaping_headers = svg_text_shaping ? " \"#{third_party_dir}/harfbuzz/src\" \"#{third_party_dir}/SheenBidi/Headers\" \"#{third_party_dir}/SheenBidi/Source\"" : ""
  text_shaping_defines = svg_text_shaping ? " LUNASVG_ENABLE_TEXT_SHAPING SB_CONFIG_UNITY" : ""
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "$(inherited) \"$(PODS_TARGET_SRCROOT)/cpp/svg/compat\" \"#{lunasvg_dir}/include\" \"#{lunasvg_dir}/source\" \"#{lunasvg_dir}/plutovg/include\"#{text_shaping_headers}",
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) LUNASVG_BUILD LUNASVG_BUILD_STATIC PLUTOVG_BUILD PLUTOVG_BUILD_STATIC LUNASVG_DISABLE_EXTERNAL_RESOURCES#{text_shaping_defines}",
    "GCC_C_LANGUAGE_STANDARD" => "gnu11",
    "GCC_OPTIMIZATION_LEVEL" => "2",
  }

  s.resource_bundles = {'RNGoogleMapsPlusPrivacy' => ['ios/Resources/PrivacyInfo.xcprivacy']}

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  spm_dependency(s,
    url: 'https://github.com/googlemaps/ios-maps-sdk',
    requirement: { kind: 'exactVersion', version: '11.2.0' },
    products: ['GoogleMaps']
  )
  spm_dependency(s,
    url: 'https://github.com/googlemaps/google-maps-ios-utils',
    requirement: { kind: 'exactVersion', version: '7.1.2' },
    products: ['GoogleMapsUtils']
  )

  load 'nitrogen/generated/ios/RNGoogleMapsPlus+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
