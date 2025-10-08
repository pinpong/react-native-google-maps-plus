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
  s.source       = { :git => "https://github.com/pinpong/react-native-google-maps-plus.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{m,mm}",
    "cpp/**/*.{hpp,cpp}",
  ]

  s.resource_bundles = {'RNGoogleMapsPlusPrivacy' => ['Resources/PrivacyInfo.xcprivacy']}

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  s.dependency 'GoogleMaps', '10.4.0'
  s.dependency 'Google-Maps-iOS-Utils', '6.1.3'
  s.dependency 'SVGKit', '3.0.0'

  load 'nitrogen/generated/ios/RNGoogleMapsPlus+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
