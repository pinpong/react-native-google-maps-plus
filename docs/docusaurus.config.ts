import { themes as prismThemes } from 'prism-react-renderer';

import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

const repo = 'https://github.com/pinpong/react-native-google-maps-plus';

const config: Config = {
  title: 'React Native Google Maps Plus',
  tagline:
    'Google Maps and Street View components for React Native, built on Nitro Modules.',
  favicon: 'img/favicon.svg',

  url: 'https://pinpong.github.io',
  baseUrl: '/react-native-google-maps-plus/',
  organizationName: 'pinpong',
  projectName: 'react-native-google-maps-plus',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    // The guide and API pages are generated plain Markdown, not MDX.
    format: 'detect',
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  clientModules: ['./src/client/fonts.ts'],

  plugins: [
    './scripts/llms-txt.mjs',
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.tsx'],
        tsconfig: '../tsconfig.json',
        plugin: ['./scripts/typedoc-without-guide.mjs'],
        readme: 'none',
        excludeExternals: true,
        disableSources: true,
        categorizeByGroup: true,
        sort: ['kind', 'instance-first', 'alphabetical'],
        hidePageHeader: true,
        hideBreadcrumbs: true,
        useCodeBlocks: true,
        expandObjects: true,
        parametersFormat: 'table',
        interfacePropertiesFormat: 'table',
        classPropertiesFormat: 'table',
        typeAliasPropertiesFormat: 'table',
        enumMembersFormat: 'table',
        propertyMembersFormat: 'table',
        typeDeclarationFormat: 'table',
        tableColumnSettings: { hideSources: true, leftAlignHeaders: true },
        sidebar: { pretty: true },
        externalSymbolLinkMappings: {
          'nitro-core': { HybridObject: '#', other: '#' },
          'react-native-nitro-modules': { HybridObject: '#', other: '#' },
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // Guide pages link to src/index.tsx themselves, API pages are generated.
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        docsRouteBasePath: '/docs',
        indexBlog: false,
        indexPages: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Google Maps Plus',
      logo: {
        alt: 'React Native Google Maps Plus',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guides',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'examples',
          position: 'left',
          label: 'Examples',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://www.npmjs.com/package/react-native-google-maps-plus',
          label: 'npm',
          position: 'right',
        },
        {
          'href': repo,
          'position': 'right',
          'className': 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Installation', to: '/docs/guides/installation' },
            {
              label: 'Upgrading from 1.x',
              to: '/docs/guides/upgrading-from-1x',
            },
            { label: 'Troubleshooting', to: '/docs/guides/troubleshooting' },
            { label: 'Examples', to: '/docs/examples' },
            { label: 'API reference', to: '/docs/api' },
            { label: 'llms.txt', href: 'pathname:///llms.txt' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'GitHub', href: repo },
            { label: 'Releases', href: `${repo}/releases` },
            { label: 'Example app', href: `${repo}/tree/main/example` },
          ],
        },
        {
          title: 'Built on',
          items: [
            { label: 'Nitro Modules', href: 'https://nitro.margelo.com' },
            {
              label: 'Google Maps SDK for iOS',
              href: 'https://developers.google.com/maps/documentation/ios-sdk',
            },
            {
              label: 'Google Maps SDK for Android',
              href: 'https://developers.google.com/maps/documentation/android-sdk',
            },
            { label: 'lunasvg', href: 'https://github.com/sammycage/lunasvg' },
          ],
        },
      ],
      copyright: `MIT licensed. Google Maps is a trademark of Google LLC, this project is not affiliated with Google.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: [
        'bash',
        'json',
        'swift',
        'kotlin',
        'groovy',
        'ruby',
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
