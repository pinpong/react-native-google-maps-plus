package com.googlemapsnitro

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.googlemapsnitro.GoogleMapsNitroPackage.AppContextHolder.context
import com.googlemapsnitro.views.HybridGoogleMapsNitroViewManager

class GoogleMapsNitroPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider { HashMap() }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    context = reactContext
    return listOf(
      HybridGoogleMapsNitroViewManager(),
    )
  }

  object AppContextHolder {
    lateinit var context: ReactApplicationContext
  }

  companion object {
    init {
      GoogleMapsNitroOnLoad.initializeNative()
    }
  }
}
