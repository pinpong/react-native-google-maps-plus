import rootConfig from '../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-relative-parent-imports': 'error',
    },
  },
];
