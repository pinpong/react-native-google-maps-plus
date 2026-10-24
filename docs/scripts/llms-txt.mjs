// Writes llms.txt and llms-full.txt (https://llmstxt.org) for AI tools, from the
// same generated Markdown the site is built from: the guide pages, the examples
// and the API reference. The build writes them next to the pages, the dev
// server serves them from the generated files directory.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const frontMatter = /^---\n([\s\S]*?)\n---\n/;

async function readPage(file) {
  const text = await readFile(file, 'utf8');
  const meta = Object.fromEntries(
    (text.match(frontMatter)?.[1] ?? '')
      .split('\n')
      .map((line) => line.match(/^(\w+):\s*"?(.*?)"?$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value])
  );
  // Outside code blocks, drop comments and the MDX imports and components.
  let inCode = false;
  const body = text
    .replace(frontMatter, '')
    .split('\n')
    .filter((line) => {
      if (line.startsWith('```')) inCode = !inCode;
      return (
        inCode ||
        !/^(<!--.*-->|import .*|<\w+ .*\/>|\{\/\*.*\*\/\})$/.test(line)
      );
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { file, meta, body };
}

async function pages(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  return Promise.all(files.map(readPage));
}

async function render({ siteConfig, siteDir, baseUrl }) {
  const site = `${siteConfig.url}${baseUrl}`;
  const docsDir = path.join(siteDir, 'docs');
  const byPosition = (a, b) =>
    Number(a.meta.sidebar_position) - Number(b.meta.sidebar_position);

  const guides = (await pages(path.join(docsDir, 'guides'), '.md')).sort(
    byPosition
  );

  // Use cases first, then features, each in sidebar order.
  const examples = (await pages(path.join(docsDir, 'examples'), '.mdx'))
    .filter((page) => page.meta.id)
    .map((page) => ({
      ...page,
      group: path.basename(path.dirname(page.file)),
    }))
    .sort((a, b) =>
      a.group === b.group ? byPosition(a, b) : a.group === 'use-cases' ? -1 : 1
    );

  const index = path.join(docsDir, 'api', 'index.md');
  const api = (await pages(path.join(docsDir, 'api'), '.md')).sort((a, b) =>
    a.file === index ? -1 : b.file === index ? 1 : 0
  );

  // Links between the Markdown files become links to the website.
  const absolute = ({ file, body }) => {
    const dir = path.posix.dirname(path.relative(docsDir, file));
    return body.replace(
      /\]\((?!https?:|#|\/)([^)\s]+?)\.mdx?(#[^)]*)?\)/g,
      (match, target, hash = '') => {
        const page = path.posix
          .join(dir, target)
          .replace(/\/index$/, '')
          .replace(/^index$/, '');
        return `](${site}docs/${page}${hash})`;
      }
    );
  };

  const shared = await readFile(
    path.join(siteDir, 'examples', 'shared.ts'),
    'utf8'
  );

  const header = `# ${siteConfig.title}\n\n> ${siteConfig.tagline}\n`;

  const llms = [
    header,
    '## Guides\n',
    ...guides.map(
      ({ meta }) =>
        `- [${meta.title}](${site}docs/guides/${meta.id}): ${meta.description}`
    ),
    '\n## Examples\n',
    ...examples.map(
      ({ meta, group }) =>
        `- [${meta.title}](${site}docs/examples/${group}/${meta.id}): ${meta.description}`
    ),
    '\n## API\n',
    `- [API reference](${site}docs/api): props, methods and types`,
    '\n## Optional\n',
    `- [Full documentation](${site}llms-full.txt): all guides, examples with their code and the API reference in one file`,
    '',
  ].join('\n');

  const full = [
    header,
    ...guides.map((page) => `# ${page.meta.title}\n\n${absolute(page)}\n`),
    ...examples.map(
      (page) => `# Example: ${page.meta.title}\n\n${absolute(page)}\n`
    ),
    '# Example helpers\n',
    'The examples import these helpers from `shared.ts`.\n',
    `\`\`\`ts title="shared.ts"\n${shared.trim()}\n\`\`\`\n`,
    ...api.map((page) => `${absolute(page)}\n`),
  ]
    .join('\n')
    .replace(/\]\(\/docs\//g, `](${site}docs/`);

  return { 'llms.txt': llms, 'llms-full.txt': full };
}

async function write(files, dir) {
  await mkdir(dir, { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, text]) =>
      writeFile(path.join(dir, name), text)
    )
  );
}

export default function llmsTxt(context) {
  const devDir = path.join(context.generatedFilesDir, 'llms-txt');
  return {
    name: 'llms-txt',
    async allContentLoaded() {
      await write(await render(context), devDir);
    },
    configureWebpack() {
      return {
        devServer: {
          static: [{ directory: devDir, publicPath: context.baseUrl }],
        },
      };
    },
    async postBuild({ outDir }) {
      await write(await render(context), outDir);
    },
  };
}
