import type { ConfigPlugin } from '@expo/config-plugins';
import type { RNGoogleMapsPlusExpoPluginProps } from './types';
import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);

import { createRunOncePlugin } from '@expo/config-plugins';
import withIosGoogleMapsPlus from './ios/withIosGoogleMapsPlus';
import withAndroidGoogleMapsPlus from './android/withAndroidGoogleMapsPlus';

const withGoogleMapsPlus: ConfigPlugin<RNGoogleMapsPlusExpoPluginProps> = (
  config,
  props
) => {
  config = withAndroidGoogleMapsPlus(config, props);
  config = withIosGoogleMapsPlus(config, props);
  return config;
};

module.exports = createRunOncePlugin(withGoogleMapsPlus, pkg.name, pkg.version);
