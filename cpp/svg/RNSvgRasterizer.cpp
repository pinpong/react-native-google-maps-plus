#include "RNSvgRasterizer.h"

#include <hb-ot.h>
#include <hb.h>
#include <lunasvg.h>
#include <plutovg.h>

#include <algorithm>
#include <bit>
#include <cctype>
#include <cmath>
#include <cstdint>
#include <atomic>
#include <deque>
#include <limits>
#include <memory>
#include <mutex>
#include <optional>
#include <span>
#include <string>
#include <string_view>
#include <unordered_map>
#include <utility>
#include <vector>

#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

namespace {

using Bytes = std::span<const uint8_t>;

Bytes bytesOf(const void* data, size_t length) {
  return {static_cast<const uint8_t*>(data), length};
}

std::string base64Encode(Bytes data) {
  static constexpr char kAlphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  std::string out;
  out.reserve(((data.size() + 2) / 3) * 4);
  for (size_t i = 0; i < data.size(); i += 3) {
    uint32_t n = uint32_t(data[i]) << 16;
    if (i + 1 < data.size()) n |= uint32_t(data[i + 1]) << 8;
    if (i + 2 < data.size()) n |= uint32_t(data[i + 2]);
    out.push_back(kAlphabet[(n >> 18) & 63]);
    out.push_back(kAlphabet[(n >> 12) & 63]);
    out.push_back(i + 1 < data.size() ? kAlphabet[(n >> 6) & 63] : '=');
    out.push_back(i + 2 < data.size() ? kAlphabet[n & 63] : '=');
  }
  return out;
}

std::string base64Decode(std::string_view input) {
  auto value = [](char c) -> int {
    if (c >= 'A' && c <= 'Z') return c - 'A';
    if (c >= 'a' && c <= 'z') return c - 'a' + 26;
    if (c >= '0' && c <= '9') return c - '0' + 52;
    if (c == '+' || c == '-') return 62;
    if (c == '/' || c == '_') return 63;
    return -1;
  };
  std::string out;
  out.reserve(input.size() * 3 / 4);
  uint32_t buffer = 0;
  int bits = 0;
  for (char c : input) {
    int v = value(c);
    if (v < 0) continue;
    buffer = (buffer << 6) | uint32_t(v);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push_back(char((buffer >> bits) & 0xFF));
    }
  }
  return out;
}

std::string percentDecode(std::string_view input) {
  auto hexValue = [](char c) -> int {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
  };
  std::string out;
  out.reserve(input.size());
  for (size_t i = 0; i < input.size(); ++i) {
    if (input[i] == '%' && i + 2 < input.size() && hexValue(input[i + 1]) >= 0 && hexValue(input[i + 2]) >= 0) {
      out.push_back(char(hexValue(input[i + 1]) * 16 + hexValue(input[i + 2])));
      i += 2;
    } else {
      out.push_back(input[i]);
    }
  }
  return out;
}

// keeps float error from pushing an exact size to the next pixel
constexpr float kPixelSlack = 0.01f;

// plutovg keeps the byte size of a surface in an int
bool fitsSurface(double width, double height) {
  return width >= 1 && height >= 1 && width * height * 4 <= std::numeric_limits<int>::max();
}

bool looksLikeSvg(std::string_view data) {
  if (data.starts_with("\xEF\xBB\xBF")) data.remove_prefix(3);
  auto first = std::ranges::find_if_not(data, [](unsigned char c) { return std::isspace(c) != 0; });
  return first != data.end() && *first == '<';
}

void appendPng(void* closure, void* data, int size) {
  auto* out = static_cast<std::string*>(closure);
  out->append(static_cast<const char*>(data), size_t(size));
}

void prepareImages(lunasvg::Document& document, float scale, std::vector<std::string>* remoteHrefs);

// lunasvg sizes an <image> without width or height from the image, which it can't load for svg
void sizeFromSvg(lunasvg::Element& image, float svgW, float svgH) {
  bool hasW = image.hasAttribute("width");
  bool hasH = image.hasAttribute("height");
  if (hasW && hasH) return;
  lunasvg::Box box = image.getBoundingBox();
  if (!hasW) image.setAttribute("width", std::to_string(hasH ? box.h * svgW / svgH : svgW));
  if (!hasH) image.setAttribute("height", std::to_string(hasW ? box.w * svgH / svgW : svgH));
}

std::string rasterizeToDataUri(std::string_view svg, lunasvg::Element& image, float scale) {
  auto document = lunasvg::Document::loadFromData(svg.data(), svg.size());
  if (!document) return {};

  float intrinsicW = document->width();
  float intrinsicH = document->height();
  if (intrinsicW <= 0.f || intrinsicH <= 0.f) return {};
  sizeFromSvg(image, intrinsicW, intrinsicH);
  // size of the image in output pixels, through every viewBox and transform above it
  lunasvg::Box box = image.getBoundingBox();
  lunasvg::Matrix matrix = image.getGlobalMatrix();
  float displayW = box.w * std::hypot(matrix.a, matrix.b) * scale;
  float displayH = box.h * std::hypot(matrix.c, matrix.d) * scale;
  float fit = std::min(displayW / intrinsicW, displayH / intrinsicH);
  float rasterW = std::ceil(intrinsicW * fit - kPixelSlack);
  float rasterH = std::ceil(intrinsicH * fit - kPixelSlack);
  if (!fitsSurface(rasterW, rasterH)) return {};

  prepareImages(*document, fit, nullptr);
  lunasvg::Bitmap bitmap = document->renderToBitmap(int(rasterW), int(rasterH));
  if (bitmap.isNull()) return {};

  std::string png;
  if (!bitmap.writeToPng(appendPng, &png) || png.empty()) return {};
  return "data:image/png;base64," + base64Encode(bytesOf(png.data(), png.size()));
}

std::string decodeSvgDataUri(std::string_view href) {
  auto comma = href.find(',');
  if (comma == std::string_view::npos) return {};
  auto header = href.substr(0, comma);
  auto payload = href.substr(comma + 1);
  if (header.find(";base64") != std::string_view::npos) return base64Decode(payload);
  return percentDecode(payload);
}

void prepareImages(lunasvg::Document& document, float scale, std::vector<std::string>* remoteHrefs) {
  for (auto& image : document.querySelectorAll("image")) {
    const std::string& href = image.getAttribute("href");
    if (href.starts_with("data:image/svg+xml")) {
      image.setAttribute("href", rasterizeToDataUri(decodeSvgDataUri(href), image, scale));
    } else if (remoteHrefs && (href.starts_with("http://") || href.starts_with("https://"))) {
      if (std::ranges::find(*remoteHrefs, href) == remoteHrefs->end()) {
        remoteHrefs->push_back(href);
      }
    }
  }
}

}  // namespace

struct RNSvgDocument {
  std::unique_ptr<lunasvg::Document> svg;
  std::vector<std::string> remoteHrefs;
  int width;
  int height;
  float scale;
};

RNSvgDocument* rn_svg_document_create(const char* data, size_t length, int width, int height) try {
  if (!fitsSurface(width, height)) return nullptr;
  auto svg = lunasvg::Document::loadFromData(data, length);
  if (!svg) return nullptr;
  float intrinsicW = svg->width();
  float intrinsicH = svg->height();
  bool sized = intrinsicW > 0.f && intrinsicH > 0.f;
  float scale = sized ? std::min(float(width) / intrinsicW, float(height) / intrinsicH) : 1.f;
  auto result = std::make_unique<RNSvgDocument>(std::move(svg), std::vector<std::string>(), width, height, scale);
  prepareImages(*result->svg, scale, &result->remoteHrefs);
  return result.release();
} catch (...) {
  return nullptr;
}

void rn_svg_document_destroy(RNSvgDocument* document) {
  if (!document) return;
  delete document;
}

size_t rn_svg_document_remote_image_count(const RNSvgDocument* document) {
  return document->remoteHrefs.size();
}

const char* rn_svg_document_remote_image_href(const RNSvgDocument* document, size_t index) {
  if (index >= document->remoteHrefs.size()) return nullptr;
  return document->remoteHrefs[index].c_str();
}

bool rn_svg_document_resolve_image(RNSvgDocument* document, size_t index, const void* data, size_t length) try {
  if (index >= document->remoteHrefs.size() || length == 0 || !std::in_range<int>(length)) return false;
  const std::string& href = document->remoteHrefs[index];
  std::string_view content(static_cast<const char*>(data), length);
  bool isSvg = looksLikeSvg(content);

  std::string rasterUri;
  if (!isSvg) {
    // Same decoder lunasvg uses for <image>, so this tells whether it will be able to draw it.
    plutovg_surface_t* probe = plutovg_surface_load_from_image_data(data, int(length));
    if (!probe) return false;
    plutovg_surface_destroy(probe);
    rasterUri = "data:image/png;base64," + base64Encode(bytesOf(data, length));
  }

  bool resolved = false;
  for (auto& image : document->svg->querySelectorAll("image")) {
    if (image.getAttribute("href") != href) continue;
    std::string uri = isSvg ? rasterizeToDataUri(content, image, document->scale) : rasterUri;
    if (uri.empty()) continue;
    image.setAttribute("href", uri);
    resolved = true;
  }
  return resolved;
} catch (...) {
  return false;
}

bool rn_svg_document_render(RNSvgDocument* document, void* pixels, int width, int height, int stride, bool rgba) try {
  if (width != document->width || height != document->height || stride / 4 < width) return false;

  float intrinsicW = document->svg->width();
  float intrinsicH = document->svg->height();
  if (intrinsicW <= 0.f || intrinsicH <= 0.f) return false;
  lunasvg::Bitmap bitmap(width, height);
  if (bitmap.isNull()) return false;
  // fitted and centered, the svg keeps its aspect ratio
  float scale = document->scale;
  float left = (float(width) - intrinsicW * scale) / 2;
  float top = (float(height) - intrinsicH * scale) / 2;
  document->svg->render(bitmap, lunasvg::Matrix(scale, 0, 0, scale, left, top));

  // lunasvg writes native-endian ARGB32, i.e. B G R A in memory
  static_assert(std::endian::native == std::endian::little);
  auto* output = static_cast<uint8_t*>(pixels);
  for (size_t y = 0; y < size_t(height); ++y) {
    Bytes source(bitmap.data() + y * size_t(bitmap.stride()), size_t(width) * 4);
    std::span<uint8_t> row(output + y * size_t(stride), source.size());
    std::ranges::copy(source, row.begin());
    if (rgba) {
      for (size_t x = 0; x < row.size(); x += 4) std::swap(row[x], row[x + 2]);
    }
  }
  return true;
} catch (...) {
  return false;
}

namespace {

struct FontInfo {
  std::string family;
  bool bold;
  bool italic;
};

bool hasRange(Bytes data, size_t offset, size_t size) {
  return offset <= data.size() && data.size() - offset >= size;
}

bool hasTag(Bytes data, std::string_view tag) {
  return data.size() >= tag.size() && std::ranges::equal(data.first(tag.size()), tag);
}

uint16_t readU16(Bytes data, size_t offset) {
  return uint16_t(data[offset] << 8 | data[offset + 1]);
}

uint32_t readU32(Bytes data, size_t offset) {
  return uint32_t(readU16(data, offset)) << 16 | readU16(data, offset + 2);
}

void appendUtf8(std::string& out, uint32_t c) {
  if (c < 0x80) {
    out.push_back(char(c));
  } else if (c < 0x800) {
    out.push_back(char(0xC0 | c >> 6));
    out.push_back(char(0x80 | (c & 0x3F)));
  } else if (c < 0x10000) {
    out.push_back(char(0xE0 | c >> 12));
    out.push_back(char(0x80 | (c >> 6 & 0x3F)));
    out.push_back(char(0x80 | (c & 0x3F)));
  } else {
    out.push_back(char(0xF0 | c >> 18));
    out.push_back(char(0x80 | (c >> 12 & 0x3F)));
    out.push_back(char(0x80 | (c >> 6 & 0x3F)));
    out.push_back(char(0x80 | (c & 0x3F)));
  }
}

std::string decodeUtf16(Bytes data) {
  std::string out;
  for (size_t i = 0; i + 1 < data.size(); i += 2) {
    uint32_t c = readU16(data, i);
    if (c >= 0xD800 && c < 0xDC00 && i + 3 < data.size()) {
      uint32_t low = readU16(data, i + 2);
      if (low >= 0xDC00 && low < 0xE000) {
        c = 0x10000 + ((c - 0xD800) << 10) + (low - 0xDC00);
        i += 2;
      }
    }
    appendUtf8(out, c);
  }
  return out;
}

// name id 1 and macStyle, plutovg registers the system fonts by the same fields
std::optional<FontInfo> readFontInfo(Bytes data) {
  size_t fontOffset = data.size() >= 16 && hasTag(data, "ttcf") ? readU32(data, 12) : 0;
  if (!hasRange(data, fontOffset, 12)) return std::nullopt;
  size_t tableCount = readU16(data, fontOffset + 4);
  if (!hasRange(data, fontOffset + 12, tableCount * 16)) return std::nullopt;

  Bytes head;
  Bytes names;
  for (size_t i = 0; i < tableCount; ++i) {
    Bytes table = data.subspan(fontOffset + 12 + i * 16, 16);
    size_t offset = readU32(table, 8);
    size_t size = readU32(table, 12);
    if (!hasRange(data, offset, size)) continue;
    if (hasTag(table, "head")) head = data.subspan(offset, size);
    if (hasTag(table, "name")) names = data.subspan(offset, size);
  }
  if (head.size() < 46 || names.size() < 6) return std::nullopt;

  size_t recordCount = readU16(names, 2);
  size_t stringsOffset = readU16(names, 4);
  if (!hasRange(names, 6, recordCount * 12)) return std::nullopt;
  std::string family;
  for (size_t i = 0; i < recordCount; ++i) {
    Bytes record = names.subspan(6 + i * 12, 12);
    uint16_t platform = readU16(record, 0);
    uint16_t encoding = readU16(record, 2);
    size_t size = readU16(record, 8);
    size_t offset = stringsOffset + readU16(record, 10);
    if (readU16(record, 6) != 1 || !hasRange(names, offset, size)) continue;
    Bytes text = names.subspan(offset, size);
    if (platform == 0 || (platform == 3 && (encoding == 1 || encoding == 10))) {
      family = decodeUtf16(text);
      break;
    }
    if (platform == 1 && encoding == 0) family.assign(text.begin(), text.end());
  }
  if (family.empty()) return std::nullopt;

  uint16_t style = readU16(head, 44);
  return FontInfo{.family = std::move(family), .bold = (style & 1) != 0, .italic = (style & 2) != 0};
}

Bytes mapFile(const char* path) {
  static std::mutex mutex;
  static std::unordered_map<std::string, Bytes> files;

  std::lock_guard lock(mutex);
  if (auto it = files.find(path); it != files.end()) return it->second;
  int fd = open(path, O_RDONLY);
  if (fd < 0) return {};
  struct stat info;
  void* data = fstat(fd, &info) == 0 && info.st_size > 0
    ? mmap(nullptr, size_t(info.st_size), PROT_READ, MAP_PRIVATE, fd, 0)
    : MAP_FAILED;
  close(fd);
  if (data == MAP_FAILED) return {};
  return files.emplace(path, bytesOf(data, size_t(info.st_size))).first->second;
}

bool addFontFace(const char* family, bool bold, bool italic, Bytes data) {
  return lunasvg_add_font_face_from_data(family, bold, italic, data.data(), data.size(), nullptr, nullptr);
}

bool addFont(const char* name, Bytes data) {
  if (!addFontFace(name, false, false, data)) return false;
  if (auto info = readFontInfo(data)) addFontFace(info->family.c_str(), info->bold, info->italic, data);
  return true;
}

struct FallbackFont {
  std::string path;
  int index;
  std::string postScriptName;
  std::string language;
  bool serif = false;
  bool resolved = false;
  Bytes data;
  std::string family;
  hb_font_t* font = nullptr;
  bool loaded = false;
  std::optional<bool> registered;
};

std::mutex fallbackMutex;
std::deque<FallbackFont> fallbackFonts;
std::unordered_map<std::string, const char*> fallbackFamilies;
// the last font chosen for a script, language and design, reused for the next characters it covers like browsers do
std::unordered_map<std::string, FallbackFont*> scriptFallbacks;
RNSvgFallbackFontResolver fallbackFontResolver = nullptr;
std::atomic<RNSvgTextImageRenderer> textImageRenderer = nullptr;

std::string scriptName(hb_script_t script) {
  hb_tag_t tag = hb_script_to_iso15924_tag(script);
  return {char(tag >> 24), char(tag >> 16 & 0xFF), char(tag >> 8 & 0xFF), char(tag & 0xFF)};
}

bool equalsIgnoringCase(std::string_view a, std::string_view b) {
  return std::ranges::equal(a, b, [](char x, char y) { return std::tolower(x) == std::tolower(y); });
}

// a language tag names its script (und-Arab) or implies it (ja, ko, zh)
bool languageCoversScript(std::string_view language, std::string_view script) {
  static const std::pair<std::string_view, std::string_view> kScripts[] = {
    {"ja", "Hani Hira Kana"}, {"ko", "Hang Hani"}, {"zh", "Hani"},
    {"Jpan", "Hani Hira Kana"}, {"Kore", "Hang Hani"}, {"Hans", "Hani"}, {"Hant", "Hani"},
  };
  size_t start = 0;
  while (start < language.size()) {
    size_t end = language.find_first_of("-_, ", start);
    std::string_view subtag = language.substr(start, end == std::string_view::npos ? end : end - start);
    if (subtag.size() == 4 && equalsIgnoringCase(subtag, script)) return true;
    for (auto [name, scripts] : kScripts) {
      if (subtag == name && scripts.find(script) != std::string_view::npos) return true;
    }
    if (end == std::string_view::npos) break;
    start = end + 1;
  }
  return false;
}

std::string postScriptName(hb_face_t* face) {
  char name[256];
  unsigned int length = sizeof(name);
  hb_ot_name_get_utf8(face, HB_OT_NAME_ID_POSTSCRIPT_NAME, HB_LANGUAGE_INVALID, &length, name);
  return name;
}

bool faceHasGlyph(hb_face_t* face, uint32_t codepoint) {
  hb_font_t* font = hb_font_create(face);
  hb_codepoint_t glyph = 0;
  bool hasGlyph = hb_font_get_nominal_glyph(font, codepoint, &glyph);
  hb_font_destroy(font);
  return hasGlyph;
}

float faceWeight(hb_face_t* face) {
  hb_font_t* font = hb_font_create(face);
  float weight = hb_style_get_value(font, HB_STYLE_TAG_WEIGHT);
  hb_font_destroy(font);
  return weight;
}

// the face of a collection with the given PostScript name; the name of an instance of a variable font only shares
// the part before the dash with its faces, of those the one closest to regular; then the first face with the character
int findFallbackFace(hb_blob_t* blob, std::string_view name, uint32_t codepoint) {
  unsigned int count = hb_face_count(blob);
  std::string_view prefix = name.substr(0, name.find('-'));
  std::optional<int> prefixMatch;
  float prefixWeightDistance = 0;
  std::optional<int> glyphMatch;
  for (unsigned int index = 0; index < count; ++index) {
    hb_face_t* face = hb_face_create(blob, index);
    std::string faceName = postScriptName(face);
    bool hasGlyph = faceHasGlyph(face, codepoint);
    float weightDistance = std::abs(faceWeight(face) - 400);
    hb_face_destroy(face);
    if (!hasGlyph) continue;
    if (faceName == name) return int(index);
    if (faceName.substr(0, faceName.find('-')) == prefix && (!prefixMatch || weightDistance < prefixWeightDistance)) {
      prefixMatch = int(index);
      prefixWeightDistance = weightDistance;
    }
    if (!glyphMatch) glyphMatch = int(index);
  }
  return prefixMatch.value_or(glyphMatch.value_or(0));
}

hb_face_t* loadFallbackFace(FallbackFont& fallback, Bytes file, uint32_t codepoint) {
  hb_blob_t* blob = hb_blob_create(reinterpret_cast<const char*>(file.data()), unsigned(file.size()), HB_MEMORY_MODE_READONLY, nullptr, nullptr);
  if (!fallback.postScriptName.empty()) fallback.index = findFallbackFace(blob, fallback.postScriptName, codepoint);
  hb_face_t* face = hb_face_create(blob, unsigned(fallback.index));
  hb_blob_destroy(blob);
  return face;
}

Bytes fallbackData(FallbackFont& fallback) {
  if (fallback.data.empty()) fallback.data = mapFile(fallback.path.c_str());
  return fallback.data;
}

bool fallbackCovers(FallbackFont& fallback, uint32_t codepoint) {
  if (!fallback.loaded) {
    fallback.loaded = true;
    Bytes file = fallbackData(fallback);
    if (file.empty()) return false;
    hb_face_t* face = loadFallbackFace(fallback, file, codepoint);
    fallback.font = hb_font_create(face);
    hb_face_destroy(face);
    if (fallback.family.empty()) fallback.family = fallback.path + "#" + std::to_string(fallback.index);
  }
  hb_codepoint_t glyph = 0;
  return fallback.font && hb_font_get_nominal_glyph(fallback.font, codepoint, &glyph);
}

FallbackFont& addFallbackFont(
  const char* family, const char* path, int index, const char* postScriptName, const char* language, bool serif) {
  // a face named by PostScript name gets its index once it is loaded, so the name identifies it
  auto duplicate = std::ranges::find_if(fallbackFonts, [&](const FallbackFont& fallback) {
    return fallback.path == path && fallback.postScriptName == postScriptName && (*postScriptName || fallback.index == index);
  });
  if (duplicate != fallbackFonts.end()) return *duplicate;
  fallbackFamilies.clear();
  scriptFallbacks.clear();
  return fallbackFonts.emplace_back(FallbackFont{
    .path = path, .index = index, .postScriptName = postScriptName, .language = language, .serif = serif, .family = family});
}

bool registerFallbackFontFace(FallbackFont& fallback) {
  if (!fallback.registered) {
    Bytes file = fallbackData(fallback);
    fallback.registered = lunasvg_add_font_face_from_collection_data(
      fallback.family.c_str(), false, false, file.data(), file.size(), fallback.index, nullptr, nullptr);
  }
  return *fallback.registered;
}

// the other weights and styles of a family are registered with it, lunasvg matches them by the font
bool registerFallbackFont(FallbackFont& fallback) {
  if (!registerFallbackFontFace(fallback)) return false;
  for (auto& other : fallbackFonts) {
    if (&other != &fallback && !other.registered && other.family == fallback.family) registerFallbackFontFace(other);
  }
  return true;
}

// asks the platform for a font file when no added font covers the character
const char* resolveFallbackFont(uint32_t codepoint, const char* language, bool serif) {
  char path[1024];
  char postScriptName[256];
  if (!fallbackFontResolver ||
      !fallbackFontResolver(codepoint, language, serif, path, sizeof(path), postScriptName, sizeof(postScriptName)))
    return nullptr;
  FallbackFont& fallback = addFallbackFont("", path, 0, postScriptName, "", false);
  fallback.resolved = true;
  return fallbackCovers(fallback, codepoint) && registerFallbackFont(fallback) ? fallback.family.c_str() : nullptr;
}

std::string normalizeLanguage(std::string_view tag) {
  std::string language(tag);
  std::ranges::transform(language, language.begin(), [](char c) { return c == '_' ? '-' : char(std::tolower(c)); });
  if (language == "zh-cn" || language == "zh-sg") return "zh-hans";
  if (language == "zh-tw" || language == "zh-hk" || language == "zh-mo") return "zh-hant";
  return language;
}

// the same tag, or the same language when one of the tags has no script or region
bool languageMatches(std::string_view fontLanguages, std::string_view language) {
  std::string wanted = normalizeLanguage(language);
  std::string_view wantedPrimary = std::string_view(wanted).substr(0, wanted.find('-'));
  size_t start = 0;
  while (start < fontLanguages.size()) {
    size_t end = fontLanguages.find_first_of(", ", start);
    std::string tag = normalizeLanguage(fontLanguages.substr(start, end == std::string_view::npos ? end : end - start));
    std::string_view primary = std::string_view(tag).substr(0, tag.find('-'));
    if (!tag.empty() && (tag == wanted || (primary == wantedPrimary && (primary == tag || wantedPrimary == wanted)))) return true;
    if (end == std::string_view::npos) break;
    start = end + 1;
  }
  return false;
}

// the blocks whose characters are drawn as emoji by default, they belong to the emoji script Zsye
bool isEmoji(uint32_t codepoint) {
  return (codepoint >= 0x1F300 && codepoint <= 0x1F64F) || (codepoint >= 0x1F680 && codepoint <= 0x1F6FF) ||
         (codepoint >= 0x1F900 && codepoint <= 0x1F9FF) || (codepoint >= 0x1FA70 && codepoint <= 0x1FAFF) ||
         (codepoint >= 0x1F1E6 && codepoint <= 0x1F1FF);
}

bool isRegionalIndicator(uint32_t codepoint) {
  return codepoint >= 0x1F1E6 && codepoint <= 0x1F1FF;
}

// a font can have the letters of flags without the flags, the one that forms one glyph from a pair draws flags
bool formsFlags(FallbackFont& fallback) {
  static constexpr uint32_t kFlag[] = {0x1F1FA, 0x1F1F3};
  if (!fallbackCovers(fallback, kFlag[0])) return false;
  hb_buffer_t* buffer = hb_buffer_create();
  hb_buffer_add_utf32(buffer, kFlag, 2, 0, 2);
  hb_buffer_guess_segment_properties(buffer);
  hb_shape(fallback.font, buffer, nullptr, 0);
  bool formsFlag = hb_buffer_get_length(buffer) == 1;
  hb_buffer_destroy(buffer);
  return formsFlag;
}

// the first generic family of a font-family list, like the one browsers fall back to
std::string genericFamily(std::string_view families) {
  static constexpr std::string_view kGenericFamilies[] = {"serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"};
  size_t start = 0;
  while (start < families.size()) {
    size_t end = families.find(',', start);
    std::string_view name = families.substr(start, end == std::string_view::npos ? end : end - start);
    size_t first = name.find_first_not_of(" \t\"'");
    size_t last = name.find_last_not_of(" \t\"'");
    std::string family = first == std::string_view::npos ? "" : std::string(name.substr(first, last - first + 1));
    std::ranges::transform(family, family.begin(), [](char c) { return char(std::tolower(c)); });
    if (std::ranges::find(kGenericFamilies, family) != std::end(kGenericFamilies)) return family;
    if (end == std::string_view::npos) break;
    start = end + 1;
  }
  return "";
}

// the platform first if it resolves fonts, it knows the fonts designed for a language; then fonts of the language of
// the text, fonts that name the script of the character and all added fonts in their order; flag letters prefer fonts
// that form flags, serif text prefers the serif fallbacks and other text skips them
const char* selectFallbackFont(uint32_t codepoint, int, bool, const char* language, const char* families, void*) {
  std::lock_guard lock(fallbackMutex);
  bool serif = genericFamily(families) == "serif";
  std::string key = std::to_string(codepoint) + '|' + language + (serif ? "|serif" : "");
  if (auto it = fallbackFamilies.find(key); it != fallbackFamilies.end()) return it->second;
  std::string script = isEmoji(codepoint) ? "Zsye" : scriptName(hb_unicode_script(hb_unicode_funcs_get_default(), codepoint));
  std::string scriptKey = script + '|' + language + (serif ? "|serif" : "");
  if (auto it = scriptFallbacks.find(scriptKey); it != scriptFallbacks.end() && fallbackCovers(*it->second, codepoint)) {
    fallbackFamilies.emplace(key, it->second->family.c_str());
    return it->second->family.c_str();
  }
  auto findFallbackFont = [&](auto&& matches) -> const char* {
    for (bool serifFonts : {true, false}) {
      if (serifFonts && !serif) continue;
      for (auto& fallback : fallbackFonts) {
        if (fallback.resolved || fallback.serif != serifFonts || !matches(fallback)) continue;
        if (fallbackCovers(fallback, codepoint) && registerFallbackFont(fallback)) return fallback.family.c_str();
      }
    }
    return nullptr;
  };
  const char* family = resolveFallbackFont(codepoint, language, serif);
  if (!family && isRegionalIndicator(codepoint)) family = findFallbackFont([](FallbackFont& fallback) { return formsFlags(fallback); });
  if (!family && *language) family = findFallbackFont([&](const FallbackFont& fallback) { return languageMatches(fallback.language, language); });
  if (!family) family = findFallbackFont([&](const FallbackFont& fallback) { return languageCoversScript(fallback.language, script); });
  if (!family) family = findFallbackFont([](const FallbackFont&) { return true; });
  fallbackFamilies.emplace(key, family);
  if (family) {
    auto chosen = std::ranges::find_if(fallbackFonts, [&](const FallbackFont& fallback) { return fallback.family == family; });
    if (chosen != fallbackFonts.end() && script != "Zyyy" && script != "Zinh") scriptFallbacks[scriptKey] = &*chosen;
  }
  return family;
}

}  // namespace

bool rn_svg_add_font_face_file(const char* family, bool bold, bool italic, const char* path) try {
  Bytes file = mapFile(path);
  return !file.empty() && addFontFace(family, bold, italic, file);
} catch (...) {
  return false;
}

bool rn_svg_add_font_file(const char* name, const char* path) try {
  Bytes file = mapFile(path);
  return !file.empty() && addFont(name, file);
} catch (...) {
  return false;
}

bool rn_svg_add_fallback_font_file(
  const char* family, const char* path, int index, const char* postScriptName, const char* language, bool serif) try {
  std::lock_guard lock(fallbackMutex);
  lunasvg_set_fallback_font_func(selectFallbackFont, nullptr);
  addFallbackFont(family, path, index, postScriptName, language, serif);
  return true;
} catch (...) {
  return false;
}

namespace {

bool drawTextImage(const void* data,
                   int index,
                   const uint32_t* text,
                   int length,
                   float size,
                   int weight,
                   bool italic,
                   uint32_t color,
                   float* advance,
                   lunasvg_text_image_t* image,
                   void*) {
  RNSvgTextImageRenderer renderer = textImageRenderer;
  std::string path;
  std::string postScriptName;
  {
    std::lock_guard lock(fallbackMutex);
    auto fallback = std::ranges::find_if(fallbackFonts, [&](const FallbackFont& fallback) {
      return fallback.index == index && fallback.data.data() == data;
    });
    if (!renderer || fallback == fallbackFonts.end()) return false;
    path = fallback->path;
    postScriptName = fallback->postScriptName;
  }
  RNSvgTextImage drawn = {};
  if (!renderer(path.c_str(), postScriptName.c_str(), text, length, size, weight, italic, color, advance, image ? &drawn : nullptr))
    return false;
  if (image) *image = {drawn.data, drawn.width, drawn.height, drawn.stride, drawn.left, drawn.top};
  return true;
}

}  // namespace

void rn_svg_set_text_image_renderer(RNSvgTextImageRenderer renderer) {
  textImageRenderer = renderer;
  lunasvg_set_text_image_func(renderer ? drawTextImage : nullptr, nullptr);
}

void rn_svg_set_fallback_font_resolver(RNSvgFallbackFontResolver resolver) {
  std::lock_guard lock(fallbackMutex);
  lunasvg_set_fallback_font_func(selectFallbackFont, nullptr);
  fallbackFontResolver = resolver;
  fallbackFamilies.clear();
  scriptFallbacks.clear();
}

bool rn_svg_add_font(const char* name, const void* data, size_t length) try {
  // the font cache reads the copy as long as the process runs
  auto* copy = new uint8_t[length];
  std::ranges::copy(bytesOf(data, length), copy);
  if (addFont(name, {copy, length})) return true;
  delete[] copy;
  return false;
} catch (...) {
  return false;
}
