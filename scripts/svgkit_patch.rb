def apply_svgkit_patch(installer)
  svgkit_path = File.join(installer.sandbox.root, "SVGKit", "Source")
  return unless Dir.exist?(svgkit_path)

  package = JSON.parse(File.read(File.join(__dir__, "..", "package.json")))
  package_name = package["name"]

  puts "[#{package_name}] Applying SVGKit patch..."

  files = Dir.glob(File.join(svgkit_path, "**/*.{h,m}"))

  replacements = {
    '#import "Node.h"'       => '#import "SVGKit/Node.h"',
    '#import "CSSValue.h"'   => '#import "SVGKit/CSSValue.h"',
    '#import "SVGLength.h"'  => '#import "SVGKit/SVGLength.h"'
  }

  count = 0

  files.each do |file|
    text = File.read(file)
    new_text = text.dup

    replacements.each do |original, patched|
      new_text.gsub!(original, patched)
    end

    next if new_text == text

    File.write(file, new_text)
    count += 1
    puts "  Patched #{File.basename(file)}"
  end

  if count > 0
    puts "[#{package_name}] SVGKit patch applied (#{count} files modified)"
  else
    puts "[#{package_name}] SVGKit was already patched or no matches"
  end

  installer.pods_project.targets.each do |target|
    next unless target.name.include?("SVGKit")

    target.build_configurations.each do |config|
      current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
      v = current.to_f > 0 ? current.to_f : 0.0

      if v < 16.0
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = "16.0"
        puts "[#{package_name}] Set iOS deployment target for SVGKit (#{current || 'none'} → 16.0)"
      end
    end
  end
end
