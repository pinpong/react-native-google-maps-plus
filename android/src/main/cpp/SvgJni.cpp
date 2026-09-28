#include "SvgJni.hpp"

#include <android/bitmap.h>
#include <fbjni/fbjni.h>

#include "RNSvgRasterizer.h"

namespace margelo::nitro::rngooglemapsplus {

using namespace facebook;

static RNSvgDocument* toDocument(jlong handle) {
  return reinterpret_cast<RNSvgDocument*>(handle);
}

struct JBitmap : jni::JavaClass<JBitmap> {
  static constexpr auto kJavaDescriptor = "Landroid/graphics/Bitmap;";
};

struct JSvgDocument : jni::JavaClass<JSvgDocument> {
  static constexpr auto kJavaDescriptor = "Lcom/rngooglemapsplus/SvgDocument;";

  static jlong create(jni::alias_ref<javaobject>, jni::alias_ref<jni::JArrayByte> svg, jint width, jint height) {
    auto pinned = svg->pin();
    return reinterpret_cast<jlong>(
      rn_svg_document_create(reinterpret_cast<const char*>(pinned.get()), pinned.size(), width, height));
  }

  static void destroy(jni::alias_ref<javaobject>, jlong handle) {
    rn_svg_document_destroy(toDocument(handle));
  }

  static jint remoteImageCount(jni::alias_ref<javaobject>, jlong handle) {
    return static_cast<jint>(rn_svg_document_remote_image_count(toDocument(handle)));
  }

  static jni::local_ref<jni::JString> remoteImageHref(jni::alias_ref<javaobject>, jlong handle, jint index) {
    return jni::make_jstring(rn_svg_document_remote_image_href(toDocument(handle), static_cast<size_t>(index)));
  }

  static jboolean resolveImage(jni::alias_ref<javaobject>, jlong handle, jint index, jni::alias_ref<jni::JArrayByte> data) {
    auto pinned = data->pin();
    return rn_svg_document_resolve_image(toDocument(handle), static_cast<size_t>(index), pinned.get(), pinned.size());
  }

  static jboolean render(jni::alias_ref<javaobject>, jlong handle, jni::alias_ref<JBitmap> bitmap) {
    JNIEnv* env = jni::Environment::current();
    AndroidBitmapInfo info;
    if (AndroidBitmap_getInfo(env, bitmap.get(), &info) != ANDROID_BITMAP_RESULT_SUCCESS ||
        info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
      return JNI_FALSE;
    }
    void* pixels = nullptr;
    if (AndroidBitmap_lockPixels(env, bitmap.get(), &pixels) != ANDROID_BITMAP_RESULT_SUCCESS) return JNI_FALSE;
    bool rendered = rn_svg_document_render(
      toDocument(handle), pixels, static_cast<int>(info.width), static_cast<int>(info.height), static_cast<int>(info.stride), true);
    AndroidBitmap_unlockPixels(env, bitmap.get());
    return rendered;
  }

  static void registerNatives() {
    javaClassStatic()->registerNatives({
      makeNativeMethod("nativeCreate", JSvgDocument::create),
      makeNativeMethod("nativeDestroy", JSvgDocument::destroy),
      makeNativeMethod("nativeRemoteImageCount", JSvgDocument::remoteImageCount),
      makeNativeMethod("nativeRemoteImageHref", JSvgDocument::remoteImageHref),
      makeNativeMethod("nativeResolveImage", JSvgDocument::resolveImage),
      makeNativeMethod("nativeRender", JSvgDocument::render),
    });
  }
};

struct JSvgFontRegistry : jni::JavaClass<JSvgFontRegistry> {
  static constexpr auto kJavaDescriptor = "Lcom/rngooglemapsplus/SvgFontRegistry;";

  static jboolean addFont(jni::alias_ref<javaobject>, jni::alias_ref<jni::JString> name, jni::alias_ref<jni::JArrayByte> data) {
    auto pinned = data->pin();
    return rn_svg_add_font(name->toStdString().c_str(), pinned.get(), pinned.size());
  }

  static jboolean addFontFaceFile(
    jni::alias_ref<javaobject>, jni::alias_ref<jni::JString> family, jboolean bold, jboolean italic, jni::alias_ref<jni::JString> path) {
    return rn_svg_add_font_face_file(family->toStdString().c_str(), bold, italic, path->toStdString().c_str());
  }

  static void registerNatives() {
    javaClassStatic()->registerNatives({
      makeNativeMethod("nativeAddFont", JSvgFontRegistry::addFont),
      makeNativeMethod("nativeAddFontFaceFile", JSvgFontRegistry::addFontFaceFile),
    });
  }
};

void registerSvgNatives() {
  JSvgDocument::registerNatives();
  JSvgFontRegistry::registerNatives();
}

}  // namespace margelo::nitro::rngooglemapsplus
