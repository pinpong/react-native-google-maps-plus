/** @type {import('react-native-builder-bob').Config} */
module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'module',
    [
      'typescript',
      {
        project: 'tsconfig.json',
      },
    ],
  ],
};
