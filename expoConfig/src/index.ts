import fs from 'fs';
import path from 'path';

import { createRunOncePlugin } from '@expo/config-plugins';

import withAndroidGoogleMapsPlus from './android/withAndroidGoogleMapsPlus';
import withIosGoogleMapsPlus from './ios/withIosGoogleMapsPlus';

import type { RNGoogleMapsPlusExpoPluginProps } from './types';
import type { ConfigPlugin } from '@expo/config-plugins';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);

const withGoogleMapsPlus: ConfigPlugin<RNGoogleMapsPlusExpoPluginProps> = (
  config,
  props
) => {
  config = withAndroidGoogleMapsPlus(config, props);
  config = withIosGoogleMapsPlus(config, props);
  return config;
};

module.exports = createRunOncePlugin(withGoogleMapsPlus, pkg.name, pkg.version);
