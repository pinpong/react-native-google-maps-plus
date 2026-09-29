#pragma once

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct RNSvgDocument RNSvgDocument;

RNSvgDocument* _Nullable rn_svg_document_create(const char* _Nonnull data, size_t length, int width, int height);

void rn_svg_document_destroy(RNSvgDocument* _Nullable document);

size_t rn_svg_document_remote_image_count(const RNSvgDocument* _Nonnull document);

const char* _Nullable rn_svg_document_remote_image_href(const RNSvgDocument* _Nonnull document, size_t index);

/// Returns false if the bytes can't be decoded, so the caller can transcode them to PNG and retry.
bool rn_svg_document_resolve_image(RNSvgDocument* _Nonnull document, size_t index, const void* _Nonnull data, size_t length);

/// Writes premultiplied pixels in byte order B G R A, or R G B A if `rgba` is set.
bool rn_svg_document_render(RNSvgDocument* _Nonnull document, void* _Nonnull pixels, int width, int height, int stride, bool rgba);

bool rn_svg_add_font_face_file(const char* _Nonnull family, bool bold, bool italic, const char* _Nonnull path);

/// Adds the font under `name` and under the family and style it declares.
bool rn_svg_add_font_file(const char* _Nonnull name, const char* _Nonnull path);

/// Adds a font that draws characters no font of the `font-family` list covers.
/// Fonts with the same non-empty `family` are the weights and styles of one family.
/// The face of a collection is `index`, or the one named `postScriptName` if that is not empty.
/// `language` lists BCP 47 tags like `und-Arab` or `ja`, fonts whose tags name the script of a character are tried first.
/// `serif` fonts are only used for text whose font-family list falls back to serif.
bool rn_svg_add_fallback_font_file(const char* _Nonnull family,
                                   const char* _Nonnull path,
                                   int index,
                                   const char* _Nonnull postScriptName,
                                   const char* _Nonnull language,
                                   bool serif);

/// Writes the font file and PostScript name of a font that covers the character in the language, an empty string if
/// the text has none, and in a serif design if `serif` is set; returns false if there is no such font.
typedef bool (*RNSvgFallbackFontResolver)(uint32_t codepoint,
                                          const char* _Nonnull language,
                                          bool serif,
                                          char* _Nonnull path,
                                          size_t pathSize,
                                          char* _Nonnull postScriptName,
                                          size_t postScriptNameSize);

/// Asked for characters that neither the `font-family` list nor the added fallback fonts cover.
void rn_svg_set_fallback_font_resolver(RNSvgFallbackFontResolver _Nullable resolver);

typedef struct RNSvgTextImage {
  unsigned char* _Nullable data;
  int width;
  int height;
  int stride;
  /// From the pen position to the left edge, in pixels.
  float left;
  /// From the baseline up to the top edge, in pixels.
  float top;
} RNSvgTextImage;

/// Shapes text in a fallback font at `size` pixels and `weight`/`italic`, synthesized if the font has no such style,
/// and writes its advance; if `image` is given, also draws it into premultiplied BGRA pixels allocated with `malloc`,
/// `color` (0xAARRGGBB) is for glyphs without own colors.
typedef bool (*RNSvgTextImageRenderer)(const char* _Nonnull path,
                                       const char* _Nonnull postScriptName,
                                       const uint32_t* _Nonnull text,
                                       int length,
                                       float size,
                                       int weight,
                                       bool italic,
                                       uint32_t color,
                                       float* _Nonnull advance,
                                       RNSvgTextImage* _Nullable image);

/// Shapes and draws text in fallback fonts whose glyphs lunasvg can't read, like Apple Color Emoji.
void rn_svg_set_text_image_renderer(RNSvgTextImageRenderer _Nullable renderer);

/// Copies the data.
bool rn_svg_add_font(const char* _Nonnull name, const void* _Nonnull data, size_t length);

#ifdef __cplusplus
}
#endif
