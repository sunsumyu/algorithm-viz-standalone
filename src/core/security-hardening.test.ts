import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Build Hardening Gate (Ticket 01)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const viteConfigPath = path.join(rootDir, 'vite.config.ts');
  const cargoTomlPath = path.join(rootDir, 'src-tauri/Cargo.toml');

  it('vite.config.ts must explicitly disallow sourcemap in production build', () => {
    expect(fs.existsSync(viteConfigPath)).toBe(true);
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    // 严禁静态开启 sourcemap: true
    expect(content).not.toMatch(/sourcemap:\s*true/);
    expect(content).toMatch(/sourcemap:\s*(false|process\.env\.NODE_ENV\s*===?\s*['"]development['"])/);
  });

  it('src-tauri/Cargo.toml must configure [profile.release] with strip and lto enabled', () => {
    expect(fs.existsSync(cargoTomlPath)).toBe(true);
    const content = fs.readFileSync(cargoTomlPath, 'utf-8');

    expect(content).toContain('[profile.release]');
    expect(content).toMatch(/strip\s*=\s*true/);
    expect(content).toMatch(/lto\s*=\s*true/);
    expect(content).toMatch(/panic\s*=\s*["']abort["']/);
  });

  it('dist/ build artifact must not contain any .map files if built', () => {
    const distPath = path.join(rootDir, 'dist');
    if (!fs.existsSync(distPath)) return;

    const findMapFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(findMapFiles(fullPath));
        } else if (file.endsWith('.map')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const mapFiles = findMapFiles(distPath);
    expect(mapFiles).toEqual([]);
  });
});
