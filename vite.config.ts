/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import * as jsYaml from 'js-yaml';

function yamlPlugin(): Plugin {
  return {
    name: 'vite:yaml',
    transform(src: string, id: string) {
      if (id.endsWith('.yaml') || id.endsWith('.yml')) {
        const loadFn = typeof jsYaml.load === 'function' ? jsYaml.load : (jsYaml as any).default?.load;
        const data = loadFn(src);
        return {
          code: `export default ${JSON.stringify(data)};`,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  root: '.',
  base: './',
  plugins: [yamlPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: false,
    watch: {
      ignored: ['**/src-tauri/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
