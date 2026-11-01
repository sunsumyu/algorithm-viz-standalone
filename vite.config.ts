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

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  // 内容资产协议开关（内容资产加密管线 · 服务裁决层）：
  // 受保护发布流 `tauri:build:protected` 会注入 ALGO_VIZ_CONTENT_ORIGIN，
  // 使全部产物资源指向 apv:// 内容协议（Rust 端按授权态解密分发）；
  // 常规构建 / dev 模式不注入则保持相对路径，行为与历史版本完全一致。
  const contentOrigin = (process.env.ALGO_VIZ_CONTENT_ORIGIN || '').trim();
  const normalizedContentOrigin =
    contentOrigin && !contentOrigin.endsWith('/') ? `${contentOrigin}/` : contentOrigin;
  return {
    root: '.',
    base: isProd && normalizedContentOrigin ? normalizedContentOrigin : './',
    plugins: [yamlPlugin()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
      minifyIdentifiers: isProd,
      minifySyntax: isProd,
      minifyWhitespace: isProd,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          compact: true,
        },
      },
    },
  server: {
    host: '0.0.0.0',
    port: 23300,
    strictPort: true,
    open: false,
    watch: {
      ignored: ['**/src-tauri/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
    },
  },
    test: {
      include: ['src/**/*.test.ts'],
      pool: 'forks',
      testTimeout: 120000,
      teardownTimeout: 60000,
    },
  };
});

