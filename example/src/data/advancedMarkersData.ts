import { makeSvgIcon } from '@src/utils/mapGenerators';

import type { RNAdvancedMarkerOptions } from 'react-native-google-maps-plus';

export type AdvancedMarker = {
  title: string;
  svg?: string;
  advancedOptions: RNAdvancedMarkerOptions;
};

const svgPinGlyph = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.3l7.1-.7z" fill="#FFFFFF" />
</svg>`;

export const advancedPinMarkers: AdvancedMarker[] = [
  {
    title: 'Pin: default',
    advancedOptions: { pinConfig: {} },
  },
  {
    title: 'Pin: glyph color',
    advancedOptions: {
      pinConfig: {
        backgroundColor: '#1A73E8',
        borderColor: '#174EA6',
        glyph: { color: '#FFFFFF' },
      },
    },
  },
  {
    title: 'Pin: glyph text',
    advancedOptions: {
      pinConfig: {
        backgroundColor: '#188038',
        borderColor: '#0D652D',
        glyph: { text: 'A', textColor: '#FFFFFF' },
      },
    },
  },
  {
    title: 'Pin: glyph svg',
    advancedOptions: {
      pinConfig: {
        backgroundColor: '#9334E6',
        borderColor: '#681DA8',
        glyph: { iconSvg: { width: 14, height: 14, svgString: svgPinGlyph } },
      },
    },
  },
  {
    title: 'Pin: no glyph',
    advancedOptions: {
      pinConfig: {
        backgroundColor: '#F9AB00',
        borderColor: '#E37400',
        glyph: { color: '#00000000' },
      },
    },
  },
];

export const advancedCollisionMarkers: AdvancedMarker[] = [
  {
    title: 'R: required-and-hides-optional',
    svg: makeSvgIcon(52, 64, '#D93025', 'R'),
    advancedOptions: { collisionBehavior: 'required-and-hides-optional' },
  },
  {
    title: 'H: required-and-hides-optional',
    svg: makeSvgIcon(52, 64, '#1A73E8', 'H'),
    advancedOptions: { collisionBehavior: 'required-and-hides-optional' },
  },
  {
    title: '1: optional-and-hides-lower-priority',
    svg: makeSvgIcon(52, 64, '#188038', '1'),
    advancedOptions: { collisionBehavior: 'optional-and-hides-lower-priority' },
  },
  {
    title: '2: optional-and-hides-lower-priority',
    svg: makeSvgIcon(52, 64, '#9334E6', '2'),
    advancedOptions: { collisionBehavior: 'optional-and-hides-lower-priority' },
  },
];
