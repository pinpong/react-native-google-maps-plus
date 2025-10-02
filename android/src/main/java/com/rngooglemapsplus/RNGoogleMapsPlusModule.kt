package com.rngooglemapsplus

import com.margelo.nitro.core.Promise

class RNGoogleMapsPlusModule : HybridRNGoogleMapsPlusModuleSpec() {
  val context = RNGoogleMapsPlusPackage.AppContextHolder.context
  private val locationHandler: LocationHandler = LocationHandler(context)
  private val permissionHandler: PermissionHandler = PermissionHandler(context)
  private val playServicesHandler: PlayServicesHandler = PlayServicesHandler(context)

  override fun showLocationDialog() {
    locationHandler.showLocationDialog()
  }

  override fun openLocationSettings() {
    locationHandler.openLocationSettings()
  }

  override fun requestLocationPermission(): Promise<RNLocationPermissionResult> = permissionHandler.requestLocationPermission()

  override fun isGooglePlayServicesAvailable(): Boolean = playServicesHandler.isPlayServicesAvailable()
}
