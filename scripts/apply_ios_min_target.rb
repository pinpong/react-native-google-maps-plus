def apply_ios_min_target(installer)

  package = JSON.parse(File.read(File.join(__dir__, "..", "package.json")))
  package_name = package["name"]

  puts "[#{package_name}] Enforcing IPHONEOS_DEPLOYMENT_TARGET >= 16.0"

  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
      v = current.to_f > 0 ? current.to_f : 0.0

      if v < 16.0
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = "16.0"
        puts "[#{package_name}] Patched #{target.name} (#{current || 'none'} → 16.0)"
      end
    end
  end
end
