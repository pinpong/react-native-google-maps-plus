import { getHostComponent, NitroModules } from 'react-native-nitro-modules';

const GoogleMapsNitroConfig = require('../nitrogen/generated/shared/json/GoogleMapsNitroViewConfig.json');

import type {
  GoogleMapsNitroViewMethods,
  GoogleMapsNitroViewProps,
} from './GoogleMapsNitroView.nitro';

import type { GoogleMapsNitroModule } from './GoogleMapsNitroModule.nitro';

export * from './types';

export type { GoogleMapsNitroViewMethods, GoogleMapsNitroViewProps };

export const GoogleMapsView = getHostComponent<
  GoogleMapsNitroViewProps,
  GoogleMapsNitroViewMethods
>('GoogleMapsNitroView', () => GoogleMapsNitroConfig);

export const GoogleMapsModule =
  NitroModules.createHybridObject<GoogleMapsNitroModule>(
    'GoogleMapsNitroModule'
  );
