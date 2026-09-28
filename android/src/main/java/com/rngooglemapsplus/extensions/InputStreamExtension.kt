package com.rngooglemapsplus.extensions

import java.io.ByteArrayOutputStream
import java.io.InputStream

fun InputStream.readAtMost(limit: Int): ByteArray {
  val output = ByteArrayOutputStream()
  val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
  while (true) {
    val count = read(buffer)
    if (count < 0) break
    check(output.size() + count <= limit) { "exceeds $limit bytes" }
    output.write(buffer, 0, count)
  }
  return output.toByteArray()
}
