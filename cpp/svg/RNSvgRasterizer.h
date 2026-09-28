#pragma once

#include <stdbool.h>
#include <stddef.h>

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

/// Copies the data.
bool rn_svg_add_font(const char* _Nonnull name, const void* _Nonnull data, size_t length);

#ifdef __cplusplus
}
#endif
