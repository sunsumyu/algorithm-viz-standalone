#!/usr/bin/env vite-node
/**
 * 受保护发布编排 (Protected Release Orchestrator)
 *
 * 一键执行内容资产加密管线的完整发布流：
 *   1. 注入 ALGO_VIZ_CONTENT_ORIGIN → vite build 产物资源指向 apv:// 内容协议；
 *   2. `content:pack --out src-tauri/resources --prune`：打包 + 回读校验 + 裁剪明文；
 *   3. `tauri build`：Rust 端注册的 apv 协议处理器按授权态分发解密内容。
 *
 * 未走此流程的普通 `tauri:build` 保持历史行为（base 相对路径 + 明文资源 +
 * 管线休眠），随时可回退。
 *
 * 用法：npm run tauri:build:protected [-- --key <hex64>]
 */

import { spawnSync } from 'child_process';

const CONTENT_ORIGIN = 'http://apv.localhost/';
const ROOT = process.cwd();

function step(name: string, command: string, args: string[], env?: Record<string, string>): void {
  console.log('\n======================================================');
  console.log(`▶ [Protected Release] ${name}`);
  console.log('======================================================');
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`\n❌ [Protected Release] 步骤失败: ${name} (exit ${result.status})`);
    console.error('   受保护发布流已中止；可用普通 `tauri:build` 回退到未保护产物。');
    process.exit(result.status ?? 1);
  }
}

export function runProtectedRelease(cliArgs: string[]): void {
  console.log('======================================================');
  console.log('🔐 [Protected Release] 受保护发布流启动');
  console.log(`   内容协议源: ${CONTENT_ORIGIN}`);
  console.log('======================================================');

  // 1. 类型检查（发布前硬门禁）
  step('TypeScript 类型检查', 'npx', ['tsc', '-b', '--noEmit']);

  // 2. 受保护构建：注入内容协议源（vite base 切换）
  step(
    '受保护前端构建 (vite build + 内容协议 base)',
    'npx',
    ['vite', 'build'],
    { ALGO_VIZ_CONTENT_ORIGIN: CONTENT_ORIGIN },
  );

  // 3. 打包 + 回读校验 + 裁剪明文 → src-tauri/resources
  const packArgs = ['scripts/build-content-pack.ts', '--', '--dist', 'dist', '--out', 'src-tauri/resources', '--prune', '--origin', CONTENT_ORIGIN];
  const keyIdx = cliArgs.indexOf('--key');
  if (keyIdx >= 0 && cliArgs[keyIdx + 1]) {
    packArgs.push('--key', cliArgs[keyIdx + 1]);
  }
  step('内容资产打包 + 明文裁剪', 'npx', ['vite-node', ...packArgs]);

  // 4. tauri build（Rust apv 协议处理器 + 资源打包）
  // 置空 beforeBuildCommand：构建已由本编排完成（步骤 2/3），
  // 且默认的 `npm run build` 会以相对 base 重建 dist，冲掉受保护构建状态。
  // tauri.protected.json: 置空 beforeBuildCommand（构建已由本编排完成，
  // 默认的 `npm run build` 会以相对 base 重建 dist，冲掉受保护构建状态）
  step(
    'Tauri 桌面端构建',
    'npx',
    ['tauri', 'build', '--config', 'src-tauri/tauri.protected.json'],
  );

  console.log('\n======================================================');
  console.log('✅ [Protected Release] 受保护产物构建完成');
  console.log('   - dist 内容明文已裁剪，算法资产仅存在于加密包');
  console.log('   - 安装包内置 content.apack + 主密钥资源');
  console.log('   - 运行期: 未授权请求内容资产 → 403；激活/登录后 → 解密分发');
  console.log('   - 验收清单见 docs/encrypted-content-activation.md');
  console.log('======================================================');
}

// CLI 入口（主模块且非 Vitest 环境时才执行）
{
  // CLI 入口（Vitest 环境不执行; 本文件不被其他脚本 import, 无副作用问题）
  if (!process.env.VITEST) {
    const scriptIdx = process.argv.findIndex((a) => a.includes('release-protected'));
    const cliArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
    runProtectedRelease(cliArgs.filter((a) => a !== '--'));
  }
}
