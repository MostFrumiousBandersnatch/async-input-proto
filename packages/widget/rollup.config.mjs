import ts from 'rollup-plugin-ts';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        assetFileNames: '[name][extname]',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      ts({
        tsconfig: './tsconfig.json',
      }),
      terser(), // minifies generated bundles
      scss(),
    ],
  },
];
