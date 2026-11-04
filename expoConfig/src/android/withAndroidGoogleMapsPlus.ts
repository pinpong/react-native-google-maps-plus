import {
  withAndroidManifest,
  withGradleProperties,
} from '@expo/config-plugins';
import {
  addMetaDataItemToMainApplication,
  getMainApplicationOrThrow,
  removeMetaDataItemFromMainApplication,
} from '@expo/config-plugins/build/android/Manifest';

import type { RNGoogleMapsPlusExpoPluginProps } from '../types';
import type { ConfigPlugin } from '@expo/config-plugins';

const SVG_TEXT_SHAPING = 'RNGoogleMapsPlus_svgTextShaping';

const withMapsAndroid: ConfigPlugin<RNGoogleMapsPlusExpoPluginProps> = (
  config,
  props
) => {
  config = withGradleProperties(config, (conf) => {
    conf.modResults = conf.modResults.filter(
      (item) => !(item.type === 'property' && item.key === SVG_TEXT_SHAPING)
    );
    if (props?.svgTextShaping === false) {
      conf.modResults.push({
        type: 'property',
        key: SVG_TEXT_SHAPING,
        value: 'false',
      });
    }
    return conf;
  });

  return withAndroidManifest(config, (conf) => {
    const manifest = conf.modResults;
    const mainApplication = getMainApplicationOrThrow(manifest);

    const apiKey =
      props?.googleMapsAndroidApiKey ??
      process.env.GOOGLE_MAPS_API_KEY_ANDROID ??
      null;

    if (apiKey) {
      addMetaDataItemToMainApplication(
        mainApplication,
        'com.google.android.geo.API_KEY',
        apiKey
      );
    } else {
      removeMetaDataItemFromMainApplication(
        mainApplication,
        'com.google.android.geo.API_KEY'
      );
      console.warn(
        '[react-native-google-maps-plus] No Android API key provided. Removed existing entry.'
      );
    }

    return conf;
  });
};

export default withMapsAndroid;
