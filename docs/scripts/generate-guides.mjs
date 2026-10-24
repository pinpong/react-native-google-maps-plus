// Builds the guide pages from the @packageDocumentation comment in src/index.tsx.
// The comment stays the single source, so the guide also shows up in IDE hovers.
// Every `# Heading` becomes its own page, `@example` blocks feed the landing page.
// Also builds a page for every example in docs/examples.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const source = path.join(docsRoot, '..', 'src', 'index.tsx');
const guidesDir = path.join(docsRoot, 'docs', 'guides');
const snippetsFile = path.join(docsRoot, 'src', 'generated', 'snippets.json');
// Maps the anchors of the old single page docs to the guide pages.
const anchorsFile = path.join(docsRoot, 'src', 'generated', 'anchors.json');
const editUrl =
  'https://github.com/pinpong/react-native-google-maps-plus/edit/dev/src/index.tsx';

// Same rules as github-slugger, which Docusaurus uses for heading anchors.
const slug = (text) =>
  text
    .replace(/`/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

const comment = (await readFile(source, 'utf8')).match(
  /\/\*\*\n \* @packageDocumentation\n([\s\S]*?)\n \*\//
);
if (!comment) throw new Error(`No @packageDocumentation comment in ${source}`);

const lines = comment[1]
  .split('\n')
  .map((line) => line.replace(/^ \*( |$)/, ''));
const exampleStart = lines.findIndex((line) => line.startsWith('@example'));
const guideLines = exampleStart === -1 ? lines : lines.slice(0, exampleStart);

const pages = [];
let inFence = false;
for (const line of guideLines) {
  if (line.startsWith('```')) inFence = !inFence;
  if (!inFence && line.startsWith('# ')) {
    const title = line.slice(2).trim();
    pages.push({ title, id: slug(title), lines: [], anchors: new Set() });
  } else if (pages.length > 0) {
    const page = pages[pages.length - 1];
    if (!inFence && /^#{2,6} /.test(line)) {
      page.anchors.add(slug(line.replace(/^#+ /, '')));
    }
    page.lines.push(line);
  }
}

const pageForAnchor = (anchor) =>
  pages.find((page) => page.id === anchor || page.anchors.has(anchor));

const rewriteLinks = (text, current) =>
  text.replace(/\]\(#([^)]+)\)/g, (match, anchor) => {
    const target = pageForAnchor(anchor);
    if (!target) {
      throw new Error(
        `Link to unknown section #${anchor} in "${current.title}"`
      );
    }
    if (target === current) return match;
    return target.id === anchor
      ? `](./${target.id}.md)`
      : `](./${target.id}.md#${anchor})`;
  });

// Search results and link previews show these, a new guide page needs one.
const descriptions = {
  'installation':
    'Install the package and set up the Google Maps SDKs and API keys for iOS, Android and Expo.',
  'usage':
    'How the map and Street View components work: overlays as props, initial options, callbacks and native methods.',
  'upgrading-from-1x':
    'Breaking changes from 1.x and the steps to upgrade an app to 2.x.',
  'location':
    'When location updates run, how they relate to the blue dot, and the permission APIs.',
  'svg-markers':
    'Any SVG string as marker or info window icon, rendered natively with lunasvg. Size, images and fonts.',
  'advanced-markers':
    'Google Advanced Markers with pins, glyphs and collision behavior, and how they fall back.',
  'troubleshooting':
    'Fixes for common build and runtime errors on iOS and Android.',
  'limitations':
    'Known limitations and platform differences of SVG markers, heatmaps, Advanced Markers, lite mode and location.',
  'api-keys': 'Where to create and configure the Google Maps API keys.',
  'native-dependencies':
    'The native SDKs and libraries the package uses, and the licenses to ship with an app.',
};

const describe = (page) => {
  const description = descriptions[page.id];
  if (!description) {
    throw new Error(
      `No description for the guide page "${page.title}" (${page.id}), add one to docs/scripts/generate-guides.mjs`
    );
  }
  return description;
};

await rm(guidesDir, { recursive: true, force: true });
await mkdir(guidesDir, { recursive: true });

for (const [index, page] of pages.entries()) {
  const body = rewriteLinks(page.lines.join('\n').trim(), page);
  const frontMatter = [
    '---',
    `id: ${page.id}`,
    `title: ${JSON.stringify(page.title)}`,
    `sidebar_position: ${index + 1}`,
    `description: ${JSON.stringify(describe(page))}`,
    `custom_edit_url: ${editUrl}`,
    '---',
  ].join('\n');
  await writeFile(
    path.join(guidesDir, `${page.id}.md`),
    `${frontMatter}\n\n<!-- Generated from src/index.tsx, edit the guide there. -->\n\n${body}\n`
  );
}

const snippets = [];
if (exampleStart !== -1) {
  let current;
  let inCode = false;
  for (const line of lines.slice(exampleStart)) {
    if (line.startsWith('@example')) {
      current = { title: line.replace('@example', '').trim(), code: [] };
      snippets.push(current);
    } else if (line.startsWith('```')) {
      inCode = !inCode;
    } else if (current && inCode) {
      current.code.push(line);
    }
  }
}
await mkdir(path.dirname(snippetsFile), { recursive: true });
await writeFile(
  snippetsFile,
  JSON.stringify(
    snippets.map(({ title, code }) => ({
      title,
      code: code.join('\n').trim(),
    })),
    null,
    2
  ) + '\n'
);

const anchors = {};
for (const page of pages) {
  anchors[page.id] = page.id;
  for (const anchor of page.anchors) anchors[anchor] ??= page.id;
}
await writeFile(anchorsFile, JSON.stringify(anchors, null, 2) + '\n');

// ---------- examples

const examplesSource = path.join(docsRoot, 'examples');
const examplesDir = path.join(docsRoot, 'docs', 'examples');
const examplesFile = path.join(docsRoot, 'src', 'generated', 'examples.json');
const examplesUrl =
  'https://github.com/pinpong/react-native-google-maps-plus/blob/dev/docs/examples';
const examplesEditUrl =
  'https://github.com/pinpong/react-native-google-maps-plus/edit/dev/docs/examples';

// Props link to their row in the API reference. hybridRef comes from Nitro and
// is not in the reference, the guide explains it.
const propLink = (prop) => {
  if (prop === 'hybridRef') return '/docs/guides/usage#methods';
  if (prop === 'GoogleMapsStreetView') {
    return '/docs/api/interfaces/RNGoogleMapsPlusStreetViewProps';
  }
  return `/docs/api/interfaces/RNGoogleMapsPlusViewProps#property-${prop.toLowerCase()}`;
};

const escapeMdx = (text) =>
  text.replace(/[{}<>]/g, (c) => `&#${c.charCodeAt(0)};`);

// The comment at the top of an example: title, description, @alt and @props.
const readExample = async (id) => {
  const file = path.join(examplesSource, `${id}.tsx`);
  const source = await readFile(file, 'utf8');
  const header = source.match(/^\/\*\*\n([\s\S]*?)\n \*\/\n/);
  if (!header) throw new Error(`${file} has no header comment`);
  const tags = {};
  const text = [];
  for (const line of header[1].split('\n')) {
    const content = line.replace(/^ \*( |$)/, '');
    const tag = content.match(/^@(\w+) (.+)$/);
    if (tag) tags[tag[1]] = tag[2].trim();
    else text.push(content);
  }
  const [title, ...rest] = text.join('\n').trim().split('\n');
  const description = rest.join(' ').replace(/\s+/g, ' ').trim();
  if (!title || !description || !tags.alt || !tags.props) {
    throw new Error(
      `${file} needs a title, a description, @alt and @props in its header`
    );
  }
  return {
    id,
    title,
    description,
    alt: tags.alt,
    props: tags.props.split(',').map((prop) => prop.trim()),
    code: source.slice(header[0].length).trim(),
  };
};

// docs/examples/index.ts lists the examples in two groups.
const groups = [
  { id: 'use-cases', list: 'useCases', label: 'Use cases' },
  { id: 'features', list: 'features', label: 'Features' },
];
const registry = await readFile(path.join(examplesSource, 'index.ts'), 'utf8');
const examples = [];
for (const group of groups) {
  const list = registry.match(
    new RegExp(`export const ${group.list}[^=]*= \\[([\\s\\S]*?)\\];`)
  );
  if (!list) throw new Error(`docs/examples/index.ts has no ${group.list}`);
  const entries = [...list[1].matchAll(/id: '([\w-]+)',\s*title: '([^']+)'/g)];
  if (entries.length !== list[1].split('id: ').length - 1) {
    throw new Error(
      `Every entry in ${group.list} in docs/examples/index.ts needs an id and a title in single quotes`
    );
  }
  for (const [, id, title] of entries) {
    const example = await readExample(id);
    if (example.title !== title) {
      throw new Error(
        `docs/examples/index.ts calls ${id} "${title}", its header "${example.title}"`
      );
    }
    examples.push({ ...example, group: group.id });
  }
}

await rm(examplesDir, { recursive: true, force: true });
for (const [index, group] of groups.entries()) {
  await mkdir(path.join(examplesDir, group.id), { recursive: true });
  await writeFile(
    path.join(examplesDir, group.id, '_category_.json'),
    JSON.stringify(
      { label: group.label, position: index + 2, collapsed: false },
      null,
      2
    ) + '\n'
  );
}

await writeFile(
  path.join(examplesDir, 'index.mdx'),
  [
    '---',
    'title: "Examples"',
    'sidebar_label: "Overview"',
    'sidebar_position: 1',
    `description: ${JSON.stringify(`${examples.length} use cases with screenshots on iOS and Android and the code behind them.`)}`,
    'custom_edit_url: null',
    '---',
    '',
    "import ExampleGrid from '@site/src/components/ExampleGrid';",
    '',
    '{/* Generated from docs/examples, edit the examples there. */}',
    '',
    'Each example is a single component. The screenshots are taken from exactly',
    'this code in the example app, which also lists them under **Docs Examples**.',
    'Marker text uses the Roboto fonts the example app bundles. In your app, bundle',
    'the fonts you name in the SVG, see [SVG markers](/docs/guides/svg-markers).',
    '',
    '## Use cases',
    '',
    '<ExampleGrid group="use-cases" />',
    '',
    '## Features',
    '',
    '<ExampleGrid group="features" />',
    '',
  ].join('\n')
);

for (const [index, example] of examples.entries()) {
  const file = path.join(examplesDir, example.group, `${example.id}.mdx`);
  const props = example.props
    .map((prop) => `[\`${prop}\`](${propLink(prop)})`)
    .join(', ');
  await writeFile(
    file,
    [
      '---',
      `id: ${example.id}`,
      `title: ${JSON.stringify(example.title)}`,
      `sidebar_position: ${index + 1}`,
      `description: ${JSON.stringify(example.description)}`,
      `custom_edit_url: ${examplesEditUrl}/${example.id}.tsx`,
      '---',
      '',
      "import ExampleScreens from '@site/src/components/ExampleScreens';",
      '',
      `{/* Generated from docs/examples/${example.id}.tsx, edit the example there. */}`,
      '',
      escapeMdx(example.description),
      '',
      `<ExampleScreens id=${JSON.stringify(example.id)} alt=${JSON.stringify(example.alt)} />`,
      '',
      `Uses ${props}.`,
      '',
      `\`\`\`tsx title="${example.id}.tsx"`,
      example.code,
      '\`\`\`',
      '',
      `Colors, map styles and the SVG helpers \`svg\`, \`marker\` and \`pill\` come from [\`shared.ts\`](${examplesUrl}/shared.ts). Marker text uses the Roboto fonts bundled with the example app, see [fonts](/docs/guides/svg-markers).`,
      '',
    ].join('\n')
  );
}

await writeFile(
  examplesFile,
  JSON.stringify(
    examples.map(({ id, group, title, description, alt, props }) => ({
      id,
      group,
      title,
      description,
      alt,
      props,
    })),
    null,
    2
  ) + '\n'
);

console.log(
  `Generated ${pages.length} guide pages and ${examples.length} example pages`
);
