// plutovg only locks its font caches when C11 threads are available. iOS has none and says so
// with __STDC_NO_THREADS__, which turns the locks into no-ops (see compat/threads.h).
#pragma clang diagnostic ignored "-Wbuiltin-macro-redefined"
#undef __STDC_NO_THREADS__
#define HAVE_THREADS_H 1

#include "../third_party/lunasvg/plutovg/source/plutovg-font.c"

_Static_assert(_Generic((plutovg_mutex_t*)0, mtx_t*: 1, default: 0), "plutovg font locks are disabled");
