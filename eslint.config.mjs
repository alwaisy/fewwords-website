// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import pluginCheckFile from 'eslint-plugin-check-file'

export default withNuxt(
  {
    rules: {
      'vue/html-self-closing': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  },
  // Enforce KEBAB_CASE naming convention for files and folders
  {
    name: 'app/naming-conventions',
    files: ['app/**/*.{ts,tsx,vue}', 'server/**/*.{ts,tsx}', 'layers/**/*.{ts,tsx,vue}'],
    plugins: {
      'check-file': pluginCheckFile,
    },
    rules: {
      // Enforce KEBAB_CASE for file names (but allow Nuxt dynamic routes)
      'check-file/filename-naming-convention': [
        'error',
        {
          // Apply kebab-case to all files
          '**/*.{ts,tsx,vue}': 'KEBAB_CASE',
        },
        {
          // Ignore middle extensions (e.g., .spec.ts, .test.ts)
          ignoreMiddleExtensions: true,
        },
      ],
      // Enforce KEBAB_CASE for folder names (but allow Nuxt dynamic route folders)
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/': 'KEBAB_CASE',
        },
      ],
    },
  },
  // Enforce import order for better code organization
  {
    name: 'app/import-order',
    files: ['app/**/*.{ts,tsx,vue}', 'server/**/*.{ts,tsx}', 'layers/**/*.{ts,tsx,vue}'],
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          warnOnUnassignedImports: false,
        },
      ],
    },
  },
  // Override for Nuxt dynamic routes (allow bracket notation) - must come AFTER the main rule
  {
    name: 'nuxt-dynamic-routes',
    files: ['**/pages/**/*.{ts,vue}', '**/api/**/*.{ts,vue}'],
    rules: {
      'check-file/filename-naming-convention': 'off',
      'check-file/folder-naming-convention': 'off',
    },
  }
)
