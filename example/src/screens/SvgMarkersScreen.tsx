import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { randomCoordinates } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';

function buildText(text: string) {
  return `
  <text
    x="32"
    y="36"
    font-family="Roboto, SF Pro, system-ui, sans-serif"
    font-size="11"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="#fff"
  >
    ${text}
  </text>`;
}

const MARKER_P_IMAGE_DATA_URI = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="data:image/svg+xml,%3Csvg%20width%3D%221024%22%20height%3D%221024%22%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%22512%22%20cy%3D%22512%22%20r%3D%22256%22%20fill%3D%22%23FF0000%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2264%22%2F%3E%3C%2Fsvg%3E"
  />
  ${buildText('A')}
</svg>
`;

const MARKER_P_IMAGE_SVG_BASE64 = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjUxMiIgY3k9IjUxMiIgcj0iMjU2IiBmaWxsPSIjRkYwMDAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNjQiLz4KPC9zdmc+Cg=="
  />
 ${buildText('B')}
</svg>
`;

const MARKER_P_IMAGE_BASE64_PNG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAADY0lEQVR4nO2au04bQRSGzwYwUVCkIFkxDUmQsQgtQYiLoUgBBRR0KMljgOAtEEkHjsQL0CKFNAYcQpWOqxAmIW9AGhB4vxRjI+8F8O7YXkvMJ43kWa/PzP/vjHfm7IoYDAaDwWAwGAwGg+HxYdWrISApIhMiMioib0XklYg8L359ISLnInIkIjkR2bAsK1+vvtUMoAn4BPwkGDawA3wAmqLWEQpgAjgOKNyPI2A8aj0VAzwDvlZBuJvPQHPU+u4FeAn88u1+oQDZLMzOwsgIJBLQ0qJKIgHpNMzNweamOtef70B71Dp9KYo/8nT55gZWViCZBJHKSjIJmYz6rZf9hjMBNey9V/7wEN69q1y4u/T3w+mpnwkbDTUdgIyni+vr0NYWXnypxONq6nhZilq3iNz+23vFt7Toiy+VWOwuE0aiFt+E+1Z3cFCdK+83EvJ5twE/ojbgo6M7NzfQ11d98aUyNAS27TZhOkoDnCu85eXaiS+VtbXGGAVAN2rJqigUgt3qwpaeHvcosIGusDqeaHgwLuWbqe1tkdNTjXAVcnwsksuVH7FEbbJCoWNA2lFbX9cIFRBvW2m/0ypBx4BeR213VyNUQLxt9fqdVgk6BnQ6aicnGqEC4m2r0++0SgidEAGuRCR2eyAWE7m+DhsuGK2tIpeX5UeuLMt6GiaUzghwYtUtuVRVdAz456i113GD5m3rImwoHQP+OmqplEaogHjbOg8bSseAQ0dtcFAjVECGh91HDv1OqwQdAxyrEZma0ggVkMlJ95H6L4eBpGcp3N1d+6VwKuW3FH5TdwOKJuw4tiWZTO0NWF11b4ZyD/e0dgZ4t8P9/bUTPzDglzCdidKAJtyJ0HxeJS+qLT4eh7Mzt/g9oHprmZAmjLt7RTZb/ZTY5qanGeB9pOJLAF98TajGSIjH7xK/GLXuW4Bm1EMLJ/m8SmPpzHlvHhDgG432zBBoRz20cGLbKo3V0xPsVre6etcTon3gRdR6fSmasOHXa2wbtrZgfh5GR6GjQ83tWEx9HhuDhQXI5fwSn+VXvjHFlyhOh6W7FGiwSKMN+/sARnAvlMKxR6P824cBmAZylC+bH8Yu/maGGt/n6/mKTJeo7G1aVA7vtThfkfkjzldkfterbwaDwWAwGAwGg8FgeGz8BzzZIH4flTUWAAAAAElFTkSuQmCC"
  />
 ${buildText('C')}
</svg>
`;

const MARKER_P_IMAGE_BASE64_JPG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="data:image/jpeg;base64,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"
  />
 ${buildText('D')}
</svg>
`;

const MARKER_P_IMAGE_INLINE_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="16" fill="#FF0000" stroke="#FFFFFF" stroke-width="4" />
 ${buildText('E')}
</svg>
`;

const MARKER_P_IMAGE_REMOTE_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/example/assets/red_dot.svg"
  />
   ${buildText('F')}
</svg>
`;

const MARKER_P_IMAGE_REMOTE_PNG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/example/assets/red_dot.png"
  />
 ${buildText('G')}

</svg>
`;

const MARKER_P_IMAGE_REMOTE_JPG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image
    width="64"
    height="64"
    href="https://raw.githubusercontent.com/pinpong/react-native-google-maps-plus/main/example/assets/red_dot.jpg"
  />
 ${buildText('H')}

</svg>
`;

const MARKER_P_IMAGE_USE_SYMBOL = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g id="dot">
    <circle cx="32" cy="32" r="16" fill="#FF0000" stroke="#FFF" stroke-width="4" />
     ${buildText('I')}
  </g>
  <use href="#dot" />

</svg>
`;

const MARKER_P_IMAGE_GRADIENT = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF5555" />
      <stop offset="100%" stop-color="#AA0000" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="16" fill="url(#grad)" stroke="#FFF" stroke-width="4" />
   ${buildText('J')}

</svg>
`;

const MARKER_P_IMAGE_TRANSPARENT = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="none" />
  <circle
    cx="32"
    cy="32"
    r="16"
    fill="red"
    fill-opacity="0.5"
    stroke="#FFFFFF"
    stroke-width="4"
  />
   ${buildText('K')}
</svg>
`;

const MARKER_P_IMAGE_ICON = `
<svg
  width="64"
  height="64"
  viewBox="0 0 64 64"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle
    cx="32"
    cy="32"
    r="16"
    fill="red"
    stroke="#FFFFFF"
    stroke-width="4"
  />
  <polygon
    points="
      0,-8
      2.351,-2.472
      7.608,-2.472
      3.054,0.944
      4.706,6.472
      0,3.2
      -4.706,6.472
      -3.054,0.944
      -7.608,-2.472
      -2.351,-2.472
    "
    transform="translate(32 32)"
    fill="#fff"
  />
</svg>
`;

const MARKERS = [
  MARKER_P_IMAGE_BASE64_JPG,
  MARKER_P_IMAGE_DATA_URI,
  MARKER_P_IMAGE_SVG_BASE64,
  MARKER_P_IMAGE_BASE64_PNG,
  MARKER_P_IMAGE_INLINE_SVG,
  MARKER_P_IMAGE_REMOTE_SVG,
  MARKER_P_IMAGE_REMOTE_PNG,
  MARKER_P_IMAGE_REMOTE_JPG,
  MARKER_P_IMAGE_USE_SYMBOL,
  MARKER_P_IMAGE_GRADIENT,
  MARKER_P_IMAGE_TRANSPARENT,
  MARKER_P_IMAGE_ICON,
];

export default function SvgMarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const [markers] = useState<RNMarker[]>(() =>
    MARKERS.map((svg, i) => ({
      id: i.toString(),
      zIndex: i,
      coordinate: randomCoordinates(37.7749, -122.4194, 0.01),
      iconSvg: {
        width: 64,
        height: 64,
        svgString: svg,
      },
    }))
  );

  return <MapWrapper mapRef={mapRef} markers={markers} />;
}
