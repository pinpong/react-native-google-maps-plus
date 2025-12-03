import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';

import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import prettierPlugin from 'eslint-plugin-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('@react-native', 'prettier')),
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'prettier': prettierPlugin,
      'jsdoc': jsdoc,
      'tsdoc': tsdoc,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'pathGroups': [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@src/**',
              group: 'internal',
              position: 'after',
            },
          ],
          'pathGroupsExcludedImportTypes': ['react', 'react-native'],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/**'],
              message: 'Import only from: "react-native-google-maps-plus".',
            },
          ],
        },
      ],
      'tsdoc/syntax': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'tsdoc/syntax': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'TSInterfaceDeclaration > TSPropertySignature',
            'TSTypeAliasDeclaration > TSTypeLiteral > TSPropertySignature',
            'ExportNamedDeclaration > TSTypeAliasDeclaration',
            'ExportNamedDeclaration > TSInterfaceDeclaration',
            'ExportNamedDeclaration > TSEnumDeclaration',
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > ClassDeclaration',
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/',
      'lib/',
      '.yarn/',
      'expoConfig/build/',
      'dist/',
      'android/',
      'ios/',
      'docs/',
    ],
  },
]);
