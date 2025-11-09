def apply_svgkit_patch(installer)
  svgkit_path = File.join(installer.sandbox.root, "SVGKit", "Source")
  return unless Dir.exist?(svgkit_path)

  puts "[react-native-google-maps-plus] Applying SVGKit patch..."

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
    puts "[react-native-google-maps-plus] SVGKit patch applied (#{count} files modified)"
  else
    puts "[react-native-google-maps-plus] SVGKit was already patched or no matches"
  end
end
