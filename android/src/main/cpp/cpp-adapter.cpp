#include <fbjni/fbjni.h>
#include <jni.h>
#include "RNGoogleMapsPlusOnLoad.hpp"
#include "SvgJni.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::rngooglemapsplus::registerAllNatives();
    margelo::nitro::rngooglemapsplus::registerSvgNatives();
  });
}
