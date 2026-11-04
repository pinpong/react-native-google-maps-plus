// HarfBuzz shapes a few labels per marker, so it is built for size
#define HB_OPTIMIZE_SIZE
#pragma clang attribute push(__attribute__((minsize)), apply_to = function)
#include "../third_party/harfbuzz/src/harfbuzz.cc"
#pragma clang attribute pop
