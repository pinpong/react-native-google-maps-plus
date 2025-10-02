package com.rngooglemapsplus

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.rngooglemapsplus.RNGoogleMapsPlusPackage.AppContextHolder.context
import com.rngooglemapsplus.views.HybridRNGoogleMapsPlusViewManager

class RNGoogleMapsPlusPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider { HashMap() }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    context = reactContext
    return listOf(
      HybridRNGoogleMapsPlusViewManager(),
    )
  }

  object AppContextHolder {
    lateinit var context: ReactApplicationContext
  }

  companion object {
    init {
      RNGoogleMapsPlusOnLoad.initializeNative()
    }
  }
}
