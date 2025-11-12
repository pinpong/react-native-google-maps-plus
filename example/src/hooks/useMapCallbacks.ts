import React, { useCallback } from 'react';
import {
  type GoogleMapsViewRef,
  type RNCamera,
  type RNGoogleMapsPlusViewProps,
  type RNIndoorBuilding,
  type RNIndoorLevel,
  type RNLatLng,
  type RNLocation,
  RNLocationErrorCode,
  RNMapErrorCode,
  type RNRegion,
} from 'react-native-google-maps-plus';
import { useNitroCallback } from './useNitroCallback';

export function useMapCallbacks(
  props: RNGoogleMapsPlusViewProps,
  mapRef: React.RefObject<GoogleMapsViewRef | null>,
  setMapLoaded: (loaded: boolean) => void
) {
  const hybridRef = useNitroCallback(
    useCallback(
      (ref: GoogleMapsViewRef) => {
        mapRef.current = ref;
      },
      [mapRef]
    )
  );

  const onMapError = useNitroCallback(
    props.onMapError,
    useCallback((e: RNMapErrorCode) => console.log('Map error:', e), [])
  );

  const onMapReady = useNitroCallback(
    props.onMapReady,
    useCallback((ready: boolean) => console.log('Map is ready:', ready), [])
  );

  const onMapLoaded = useNitroCallback(
    props.onMapLoaded,
    useCallback(
      (region: RNRegion, camera: RNCamera) => {
        console.log('Map is loaded:', region, camera);
        setMapLoaded(true);
      },
      [setMapLoaded]
    )
  );

  const onMapPress = useNitroCallback(
    props.onMapPress,
    useCallback((c: RNLatLng) => console.log('Map press:', c), [])
  );

  const onMapLongPress = useNitroCallback(
    props.onMapLongPress,
    useCallback((c: RNLatLng) => console.log('Map long press:', c), [])
  );

  const onPoiPress = useNitroCallback(
    props.onPoiPress,
    useCallback(
      (placeId: string, name: string, coordinate: RNLatLng) =>
        console.log('Poi press:', placeId, name, coordinate),
      []
    )
  );

  const onMarkerPress = useNitroCallback(
    props.onMarkerPress,
    useCallback((id: string) => console.log('Marker press:', id), [])
  );

  const onPolylinePress = useNitroCallback(
    props.onPolylinePress,
    useCallback((id: string) => console.log('Polyline press:', id), [])
  );

  const onPolygonPress = useNitroCallback(
    props.onPolygonPress,
    useCallback((id: string) => console.log('Polygon press:', id), [])
  );

  const onCirclePress = useNitroCallback(
    props.onCirclePress,
    useCallback((id: string) => console.log('Circle press:', id), [])
  );

  const onMarkerDragStart = useNitroCallback(
    props.onMarkerDragStart,
    useCallback(
      (id: string, latLng: RNLatLng) =>
        console.log('Marker drag start:', id, latLng),
      []
    )
  );

  const onMarkerDrag = useNitroCallback(
    props.onMarkerDrag,
    useCallback(
      (id: string, latLng: RNLatLng) => console.log('Marker drag:', id, latLng),
      []
    )
  );

  const onMarkerDragEnd = useNitroCallback(
    props.onMarkerDragEnd,
    useCallback(
      (id: string, latLng: RNLatLng) =>
        console.log('Marker drag end:', id, latLng),
      []
    )
  );

  const onIndoorBuildingFocused = useNitroCallback(
    props.onIndoorBuildingFocused,
    useCallback((b: RNIndoorBuilding) => console.log('Indoor building:', b), [])
  );

  const onIndoorLevelActivated = useNitroCallback(
    props.onIndoorLevelActivated,
    useCallback((l: RNIndoorLevel) => console.log('Indoor level:', l), [])
  );

  const onInfoWindowPress = useNitroCallback(
    props.onInfoWindowPress,
    useCallback((id: string) => console.log('InfoWindow press:', id), [])
  );

  const onInfoWindowClose = useNitroCallback(
    props.onInfoWindowClose,
    useCallback((id: string) => console.log('InfoWindow close:', id), [])
  );

  const onInfoWindowLongPress = useNitroCallback(
    props.onInfoWindowLongPress,
    useCallback((id: string) => console.log('InfoWindow long press:', id), [])
  );

  const onMyLocationPress = useNitroCallback(
    props.onMyLocationPress,
    useCallback((l: RNLocation) => console.log('MyLocation press:', l), [])
  );

  const onMyLocationButtonPress = useNitroCallback(
    props.onMyLocationButtonPress,
    useCallback(
      (press: boolean) => console.log('MyLocation button press:', press),
      []
    )
  );

  const onCameraChangeStart = useNitroCallback(
    props.onCameraChangeStart,
    useCallback(
      (r: RNRegion, cam: RNCamera, g: boolean) =>
        console.log('Camera start:', r, cam, g),
      []
    )
  );

  const onCameraChange = useNitroCallback(
    props.onCameraChange,
    useCallback(
      (r: RNRegion, cam: RNCamera, g: boolean) =>
        console.log('Camera change:', r, cam, g),
      []
    )
  );

  const onCameraChangeComplete = useNitroCallback(
    props.onCameraChangeComplete,
    useCallback(
      (r: RNRegion, cam: RNCamera, g: boolean) =>
        console.log('Camera complete:', r, cam, g),
      []
    )
  );

  const onLocationUpdate = useNitroCallback(
    props.onLocationUpdate,
    useCallback((l: RNLocation) => console.log('Location:', l), [])
  );

  const onLocationError = useNitroCallback(
    props.onLocationError,
    useCallback(
      (e: RNLocationErrorCode) => console.log('Location error:', e),
      []
    )
  );

  return {
    hybridRef,
    onMapError,
    onMapReady,
    onMapLoaded,
    onMapPress,
    onMapLongPress,
    onPoiPress,
    onMarkerPress,
    onPolylinePress,
    onPolygonPress,
    onCirclePress,
    onMarkerDragStart,
    onMarkerDrag,
    onMarkerDragEnd,
    onIndoorBuildingFocused,
    onIndoorLevelActivated,
    onInfoWindowPress,
    onInfoWindowClose,
    onInfoWindowLongPress,
    onMyLocationPress,
    onMyLocationButtonPress,
    onCameraChangeStart,
    onCameraChange,
    onCameraChangeComplete,
    onLocationUpdate,
    onLocationError,
  };
}
