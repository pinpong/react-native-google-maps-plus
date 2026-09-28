#pragma once

// C11 threads for iOS, which has no <threads.h>. Used by RNSvgPlutovgFont.c.

#include <pthread.h>

typedef pthread_mutex_t mtx_t;

enum { mtx_plain = 0, mtx_recursive = 1 };

static inline int mtx_init(mtx_t* mutex, int type) {
  pthread_mutexattr_t attributes;
  pthread_mutexattr_init(&attributes);
  if (type & mtx_recursive) pthread_mutexattr_settype(&attributes, PTHREAD_MUTEX_RECURSIVE);
  int result = pthread_mutex_init(mutex, &attributes);
  pthread_mutexattr_destroy(&attributes);
  return result;
}

static inline int mtx_lock(mtx_t* mutex) {
  return pthread_mutex_lock(mutex);
}

static inline int mtx_unlock(mtx_t* mutex) {
  return pthread_mutex_unlock(mutex);
}

static inline void mtx_destroy(mtx_t* mutex) {
  pthread_mutex_destroy(mutex);
}
