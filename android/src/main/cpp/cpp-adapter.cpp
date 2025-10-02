#include <jni.h>
#include "RNGoogleMapsPlusOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::rngooglemapsplus::initialize(vm);
}
