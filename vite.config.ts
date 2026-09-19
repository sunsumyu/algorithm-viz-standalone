/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import * as jsYaml from 'js-yaml';

// 🌟 全局环境防护：防止 Windows 下系统默认 TEMP 指向快写满的分区 (如 D:\tmp)
if (process.platform === 'win32') {
  const localAppTemp = process.env.LOCALAPPDATA 
    ? resolve(process.env.LOCALAPPDATA, 'Temp')
    : 'C:\\Users\\Aren\\AppData\\Local\\Temp';
  if (!process.env.TEMP || process.env.TEMP.startsWith('D:') || process.env.TMP?.startsWith('D:')) {
    process.env.TEMP = localAppTemp;
    process.env.TMP = localAppTemp;
  }
}

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
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
});
