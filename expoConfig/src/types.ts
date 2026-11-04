export type RNGoogleMapsPlusExpoPluginProps = {
  googleMapsAndroidApiKey: string;
  googleMapsIosApiKey: string;
  /**
   * Shapes the text of SVG markers with HarfBuzz and SheenBidi. `false` turns
   * text shaping off, see Text shaping in the SVG markers guide.
   * @defaultValue `true`
   */
  svgTextShaping?: boolean;
};
