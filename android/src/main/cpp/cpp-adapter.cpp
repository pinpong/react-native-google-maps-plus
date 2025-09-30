#include <jni.h>
#include "GoogleMapsNitroOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::googlemapsnitro::initialize(vm);
}
