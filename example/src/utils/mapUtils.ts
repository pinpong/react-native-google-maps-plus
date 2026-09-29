import type { RNLatLng, RNRegion } from 'react-native-google-maps-plus';

export const SF_CENTER: RNLatLng = { latitude: 37.7749, longitude: -122.4194 };

export function rnRegionToRegion(rn: RNRegion | null): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (rn == null) {
    return { latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 };
  }
  const { northeast, southwest } = rn.latLngBounds;

  const latitude = (northeast.latitude + southwest.latitude) / 2;
  const longitude = (northeast.longitude + southwest.longitude) / 2;

  const latitudeDelta = Math.abs(northeast.latitude - southwest.latitude);
  const longitudeDelta = Math.abs(northeast.longitude - southwest.longitude);

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}
