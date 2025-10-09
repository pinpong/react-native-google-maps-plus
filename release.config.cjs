const rules = [
  { type: 'feat', release: 'minor', title: '✨ Features' },
  { type: 'fix', release: 'patch', title: '🐛 Bug Fixes' },
  { type: 'perf', release: 'patch', title: '💨 Performance Improvements' },
  { type: 'refactor', release: 'patch', title: '🔄 Code Refactors' },
  { type: 'docs', release: false, title: '📚 Documentation' },
  { type: 'chore', release: false, title: '🛠️ Other changes' },
];

const sortMap = Object.fromEntries(
  rules.map((rule, index) => [rule.title, index])
);

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main', { name: 'dev', prerelease: 'dev' }],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { breaking: true, release: 'major' },
          { revert: true, release: 'patch' },
          ...rules.map(({ type, release }) => ({ type, release })),
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: rules.map(({ type, title }) => ({
            type,
            section: title,
          })),
        },
        writerOpts: {
          commitGroupsSort: (a, z) => sortMap[a.title] - sortMap[z.title],
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: 'release',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'release/*.tgz',
            label: 'react-native-google-maps-plus-${nextRelease.version}.tgz',
          },
        ],
      },
    ],
    [
      '@semantic-release/git',
      (context) => {
        if (context.branch.name === 'dev') {
          return false;
        }
        return {
          assets: ['package.json', 'CHANGELOG.md', 'example/package.json'],
          message:
            '🔖 release: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        };
      },
    ],
  ],
};
