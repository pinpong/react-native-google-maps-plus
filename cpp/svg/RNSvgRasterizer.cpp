#include "RNSvgRasterizer.h"

#include <lunasvg.h>
#include <plutovg.h>

#include <algorithm>
#include <bit>
#include <cctype>
#include <cmath>
#include <cstdint>
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

std::string rasterizeToDataUri(std::string_view svg, const lunasvg::Element& image, float scale) {
  auto document = lunasvg::Document::loadFromData(svg.data(), svg.size());
  if (!document) return {};

  float intrinsicW = document->width();
  float intrinsicH = document->height();
  if (intrinsicW <= 0.f || intrinsicH <= 0.f) return {};
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
