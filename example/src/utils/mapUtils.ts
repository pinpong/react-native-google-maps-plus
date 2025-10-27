import type { RNRegion } from 'react-native-google-maps-plus';

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
