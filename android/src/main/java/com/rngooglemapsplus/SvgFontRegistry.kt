package com.rngooglemapsplus

import android.util.Xml
import com.facebook.react.uimanager.ThemedReactContext
import org.xmlpull.v1.XmlPullParser
import java.io.File
import kotlin.math.abs

private const val ASSET_FONTS_DIR = "fonts"
private const val SYSTEM_FONTS_DIR = "/system/fonts"
private const val SYSTEM_FONTS_XML = "/system/etc/fonts.xml"
private const val SYSTEM_FONT_FAMILY = "sans-serif"

// lunasvg draws text without a known font-family with this family, it has no api to set another one
private const val LUNASVG_DEFAULT_FAMILY = "DejaVu Sans"
private val FONT_EXTENSIONS = setOf("ttf", "otf")
private const val FALLBACK_FAMILY_PREFIX = "fallback-"

// lunasvg keeps fonts in a process wide cache, so they are registered once for all maps
private val registerLock = Any()

@Volatile
private var registered = false

private data class SystemFont(
  val file: String,
  val index: Int,
  val weight: Int,
  val italic: Boolean,
  val fallbackFor: String?,
)

private class FallbackFonts(
  val language: String,
  val fonts: MutableList<SystemFont> = mutableListOf(),
)

private class SystemFonts(
  val families: Map<String, List<SystemFont>>,
  val aliases: Map<String, String>,
  val fallbacks: List<FallbackFonts>,
)

class SvgFontRegistry(
  private val context: ThemedReactContext,
  private val mapErrorHandler: MapErrorHandler,
) {
  fun register() {
    if (registered) return
    synchronized(registerLock) {
      if (registered) return
      runCatching { registerSystemFonts() }.onFailure {
        mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "system font register failed", it)
      }
      registerAssetFonts()
      registered = true
    }
  }

  private fun registerSystemFonts() {
    val file = File(SYSTEM_FONTS_XML)
    if (!file.canRead()) return
    val fonts = file.inputStream().use { parseSystemFonts(Xml.newPullParser().apply { setInput(it, null) }) }

    fonts.families.forEach { (family, files) -> registerFamily(family, files) }
    fonts.aliases.forEach { (alias, family) -> registerFamily(alias, fonts.families[family].orEmpty()) }
    registerFamily(LUNASVG_DEFAULT_FAMILY, fonts.families[SYSTEM_FONT_FAMILY].orEmpty())
    fonts.fallbacks.forEachIndexed { i, fallback ->
      // fonts marked fallbackFor="serif" only stand in for serif families, they form a family of their own
      val regularFirst = fallback.fonts.sortedBy { abs(it.weight - 400) + if (it.italic) 1000 else 0 }
      regularFirst.distinctBy { it.file to it.index }.forEach {
        val serif = it.fallbackFor == "serif"
        val family = "$FALLBACK_FAMILY_PREFIX$i" + if (serif) "-serif" else ""
        nativeAddFallbackFontFile(family, it.file, it.index, fallback.language, serif)
      }
    }
  }

  private fun parseSystemFonts(parser: XmlPullParser): SystemFonts {
    val families = mutableMapOf<String, MutableList<SystemFont>>()
    val aliases = mutableMapOf<String, String>()
    val fallbacks = mutableListOf<FallbackFonts>()
    var family: MutableList<SystemFont>? = null
    while (parser.next() != XmlPullParser.END_DOCUMENT) {
      if (parser.eventType == XmlPullParser.END_TAG && parser.name == "family") family = null
      if (parser.eventType != XmlPullParser.START_TAG) continue
      when (parser.name) {
        "family" -> {
          family =
            parser.getAttributeValue(null, "name")?.let { families.getOrPut(it) { mutableListOf() } } ?: parseFallback(parser, fallbacks)
        }

        "font" -> {
          parseSystemFont(parser)?.let { family?.add(it) }
        }

        "alias" -> {
          parseAlias(parser)?.let { aliases[it.first] = it.second }
        }
      }
    }
    return SystemFonts(families, aliases, fallbacks)
  }

  // families without a name are the fallback chain; like TextView by default, the compact UI variants are used
  // instead of the elegant ones, and ignored families are only kept for compatibility
  private fun parseFallback(
    parser: XmlPullParser,
    fallbacks: MutableList<FallbackFonts>,
  ): MutableList<SystemFont>? {
    if (parser.getAttributeValue(null, "variant") == "elegant" || parser.getAttributeValue(null, "ignore") == "true") return null
    return FallbackFonts(parser.getAttributeValue(null, "lang").orEmpty()).also { fallbacks.add(it) }.fonts
  }

  private fun parseSystemFont(parser: XmlPullParser): SystemFont? {
    val weight = parser.getAttributeValue(null, "weight")?.toIntOrNull() ?: 400
    val italic = parser.getAttributeValue(null, "style") == "italic"
    val index = parser.getAttributeValue(null, "index")?.toIntOrNull() ?: 0
    val fallbackFor = parser.getAttributeValue(null, "fallbackFor")
    val depth = parser.depth
    val fileName = StringBuilder()
    while (!(parser.next() == XmlPullParser.END_TAG && parser.depth == depth)) {
      if (parser.eventType == XmlPullParser.TEXT && parser.depth == depth) fileName.append(parser.text)
    }
    val name = fileName.trim()
    return if (name.isEmpty()) null else SystemFont("$SYSTEM_FONTS_DIR/$name", index, weight, italic, fallbackFor)
  }

  private fun parseAlias(parser: XmlPullParser): Pair<String, String>? {
    val name = parser.getAttributeValue(null, "name") ?: return null
    val to = parser.getAttributeValue(null, "to") ?: return null
    if (parser.getAttributeValue(null, "weight") != null) return null
    return name to to
  }

  private fun registerFamily(
    family: String,
    fonts: List<SystemFont>,
  ) {
    // lunasvg matches the faces by the weight in the font, variable fonts are listed once per instance
    fonts.distinctBy { it.file }.forEach { nativeAddFontFaceFile(family, it.weight >= 600, it.italic, it.file) }
  }

  private fun registerAssetFonts() {
    val assets = context.assets
    val files = runCatching { assets.list(ASSET_FONTS_DIR) }.getOrNull() ?: return
    for (file in files) {
      val name = file.substringBeforeLast('.', "")
      if (name.isEmpty() || file.substringAfterLast('.').lowercase() !in FONT_EXTENSIONS) continue
      runCatching {
        val data = assets.open("$ASSET_FONTS_DIR/$file").use { it.readBytes() }
        check(nativeAddFont(name, data)) { "unsupported font" }
      }.onFailure {
        mapErrorHandler.report(RNMapErrorCode.INVALID_ARGUMENT, "font register failed: $ASSET_FONTS_DIR/$file", it)
      }
    }
  }

  private external fun nativeAddFont(
    name: String,
    data: ByteArray,
  ): Boolean

  private external fun nativeAddFallbackFontFile(
    family: String,
    path: String,
    index: Int,
    language: String,
    serif: Boolean,
  ): Boolean

  private external fun nativeAddFontFaceFile(
    family: String,
    bold: Boolean,
    italic: Boolean,
    path: String,
  ): Boolean
}
