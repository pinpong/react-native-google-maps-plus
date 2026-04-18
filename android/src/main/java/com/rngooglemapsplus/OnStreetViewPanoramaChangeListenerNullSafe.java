package com.rngooglemapsplus;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.gms.maps.StreetViewPanorama;
import com.google.android.gms.maps.model.StreetViewPanoramaLocation;

public interface OnStreetViewPanoramaChangeListenerNullSafe
  extends StreetViewPanorama.OnStreetViewPanoramaChangeListener {

  @Override
  default void onStreetViewPanoramaChange(@NonNull StreetViewPanoramaLocation location) {
    onStreetViewPanoramaChangeNullable(location);
  }

  void onStreetViewPanoramaChangeNullable(@Nullable StreetViewPanoramaLocation location);
}
