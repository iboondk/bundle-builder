/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'vite.config.ts', '*.config.js', '*.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Token-discipline guard (BUILD_SPEC §3, Golden Rule 8): components must style
      // type and color through the Tailwind theme, never raw values that bypass it.
      // Layout arbitraries (h-[41px], gap-[12px], rounded-[5px]) stay allowed — the
      // spec only tokenizes the type scale, colors, radii, and card spacing.
      files: ['src/components/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/text-\\[[0-9.]+px\\]/]',
            message:
              'Use a font-size token (tailwind.config.ts fontSize), not an arbitrary text-[NNpx] value.',
          },
          {
            selector: 'TemplateElement[value.raw=/text-\\[[0-9.]+px\\]/]',
            message:
              'Use a font-size token (tailwind.config.ts fontSize), not an arbitrary text-[NNpx] value.',
          },
          {
            selector: 'Literal[value=/#[0-9a-fA-F]{6}/]',
            message: 'Use a color token (tailwind.config.ts colors) / currentColor, not a raw hex.',
          },
          {
            selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{6}/]',
            message: 'Use a color token (tailwind.config.ts colors) / currentColor, not a raw hex.',
          },
        ],
      },
    },
  ],
};
