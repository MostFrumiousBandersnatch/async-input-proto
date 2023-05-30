import ts from 'rollup-plugin-ts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: ['src/index.ts'],
    output: [
      {
        dir: 'dist/',
        format: 'es',
        sourcemap: true,
        assetFileNames: '[name][extname]',
      },
    ],
    watch: {
      include: 'src/**',
    },
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      nodeResolve({ exportConditions: ['default', 'module', 'require'] }),
      ts({
        tsconfig: './tsconfig.json',
        sourcemap: true
      }),
      terser(), // minifies generated bundles
      ...(process.env.ANALYZE ? [visualizer({filename: 'dist/stats.html'})] : []),
    ],
  },
];