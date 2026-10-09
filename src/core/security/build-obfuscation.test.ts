import { describe, it, expect } from 'vitest';
import viteConfigFn from '../../../vite.config';

describe('Vite 生产构建深度混淆与加固配置门禁 (Ticket 17)', () => {
  it('在生产模式下应激活 console/debugger drop 与标识符混淆压缩', () => {
    // 模拟生产环境
    const config = typeof viteConfigFn === 'function' 
      ? (viteConfigFn as any)({ mode: 'production', command: 'build' })
      : viteConfigFn;

    expect(config.esbuild).toBeDefined();
    expect(config.esbuild.drop).toContain('console');
    expect(config.esbuild.drop).toContain('debugger');
    expect(config.esbuild.legalComments).toBe('none');
    expect(config.esbuild.minifyIdentifiers).toBe(true);
    expect(config.esbuild.minifySyntax).toBe(true);
    expect(config.esbuild.minifyWhitespace).toBe(true);

    expect(config.build.sourcemap).toBe(false);
    expect(config.build.minify).toBe('esbuild');
  });

  it('在开发模式下不应剔除 console/debugger，保持调试敏捷度', () => {
    const config = typeof viteConfigFn === 'function'
      ? (viteConfigFn as any)({ mode: 'development', command: 'serve' })
      : viteConfigFn;

    expect(config.esbuild.drop).toEqual([]);
    expect(config.esbuild.minifyIdentifiers).toBe(false);
  });
});
