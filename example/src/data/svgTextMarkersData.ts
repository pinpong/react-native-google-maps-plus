import type { SvgMarker } from '@src/data/svgMarkersData';

const makeSvgTextMarker = (label: string, attributes = '') => `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="44" viewBox="0 0 140 44">
  <rect x="1" y="1" width="138" height="42" rx="10" fill="#FFFFFF" stroke="#1A73E8" stroke-width="2"/>
  <text x="70" y="22" font-size="18" text-anchor="middle" dominant-baseline="central" fill="#202124" ${attributes}>${label}</text>
</svg>`;

export const svgTextMarkers: SvgMarker[] = [
  {
    title: 'Arabic',
    snippet: 'Letters joined, right to left',
    svg: makeSvgTextMarker('مرحبا بالعالم'),
  },
  {
    title: 'Hebrew',
    snippet: 'Right to left',
    svg: makeSvgTextMarker('שלום עולם'),
  },
  {
    title: 'Hindi',
    snippet: 'Conjuncts and vowel signs shaped',
    svg: makeSvgTextMarker('नमस्ते दुनिया'),
  },
  {
    title: 'Thai',
    snippet: 'Marks above and below the letters',
    svg: makeSvgTextMarker('สวัสดีครับ'),
  },
  {
    title: 'Chinese',
    snippet: 'System fallback font',
    svg: makeSvgTextMarker('你好世界'),
  },
  {
    title: 'Japanese',
    snippet: 'System fallback font',
    svg: makeSvgTextMarker('こんにちは'),
  },
  {
    title: 'Korean',
    snippet: 'System fallback font',
    svg: makeSvgTextMarker('안녕하세요'),
  },
  {
    title: 'Mixed directions',
    snippet: 'Latin and Arabic in one line',
    svg: makeSvgTextMarker('Café 42 مرحبا'),
  },
  {
    title: 'Right to left with numbers',
    snippet: 'direction="rtl", the number keeps its order',
    svg: makeSvgTextMarker('السعر 123 ريال', 'direction="rtl"'),
  },
  {
    title: 'Kerning',
    snippet: 'AV and WA pairs move closer',
    svg: makeSvgTextMarker('AVAWAY office'),
  },
  {
    title: 'xml:lang="ja"',
    snippet: 'Japanese forms of the same characters',
    svg: makeSvgTextMarker('直 骨 角 海', 'xml:lang="ja"'),
  },
  {
    title: 'lang="zh-Hans"',
    snippet: 'Simplified Chinese forms of the same characters',
    svg: makeSvgTextMarker('直 骨 角 海', 'lang="zh-Hans"'),
  },
  {
    title: 'Weights',
    snippet: 'font-weight 300, 700 and 900',
    svg: makeSvgTextMarker(
      'Light <tspan font-weight="700">Bold</tspan> <tspan font-weight="900">Black</tspan>',
      'font-weight="300"'
    ),
  },
  {
    title: 'Bold fallback font',
    snippet: 'font-weight="bold" in the Arabic fallback',
    svg: makeSvgTextMarker('مرحبا بالعالم', 'font-weight="bold"'),
  },
  {
    title: 'Emoji',
    snippet: 'Skin tone, family and flag sequences',
    svg: makeSvgTextMarker('🍕📍👍🏽👨‍👩‍👧🇩🇪'),
  },
  {
    title: 'Emoji presentation and italic',
    snippet: 'Color emoji for U+FE0F, italic synthesized',
    svg: makeSvgTextMarker('❤️ ☕ <tspan font-style="italic">中文</tspan>'),
  },
  {
    title: 'Serif',
    snippet: 'Serif fallbacks for every script',
    svg: makeSvgTextMarker('Serif שלום 你好', 'font-family="serif"'),
  },
  {
    title: 'Sans serif',
    snippet: 'Sans serif fallbacks for every script',
    svg: makeSvgTextMarker('Sans שלום 你好', 'font-family="sans-serif"'),
  },
].map((marker) => ({ ...marker, width: 140, height: 44 }));
