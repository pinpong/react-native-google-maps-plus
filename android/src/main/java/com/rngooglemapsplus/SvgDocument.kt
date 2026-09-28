package com.rngooglemapsplus

import android.graphics.Bitmap

class SvgDocument(
  svg: String,
  width: Int,
  height: Int,
) : AutoCloseable {
  private var handle = nativeCreate(svg.toByteArray(), width, height)

  val isValid: Boolean
    get() = handle != 0L

  val remoteImageHrefs: List<String>
    get() = if (isValid) List(nativeRemoteImageCount(handle)) { nativeRemoteImageHref(handle, it) } else emptyList()

  fun resolveImage(
    index: Int,
    data: ByteArray,
  ): Boolean = nativeResolveImage(handle, index, data)

  fun render(bitmap: Bitmap): Boolean = nativeRender(handle, bitmap)

  override fun close() {
    if (!isValid) return
    nativeDestroy(handle)
    handle = 0L
  }

  private external fun nativeCreate(
    svg: ByteArray,
    width: Int,
    height: Int,
  ): Long

  private external fun nativeDestroy(handle: Long)

  private external fun nativeRemoteImageCount(handle: Long): Int

  private external fun nativeRemoteImageHref(
    handle: Long,
    index: Int,
  ): String

  private external fun nativeResolveImage(
    handle: Long,
    index: Int,
    data: ByteArray,
  ): Boolean

  private external fun nativeRender(
    handle: Long,
    bitmap: Bitmap,
  ): Boolean
}
