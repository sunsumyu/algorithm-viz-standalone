#!/usr/bin/env vite-node
/**
 * 构建期内容资产打包器 CLI（薄壳）
 *
 * 全部实现位于 `content-pack-lib.ts`（纯函数库，供 verify / release 等脚本复用，
 * 无 CLI 副作用）；本文件仅承担命令行入口职责。
 */

import * as path from 'path';
import {
  buildContentPackForDist,
  buildSelftestFixture,
  parsePackIndex,
  pruneContentFiles,
  resolveMasterKeyHex,
  writeBundleOutputs,
} from './content-pack-lib';

export * from './content-pack-lib';

export function runCli(): void {
  const scriptIdx = process.argv.findIndex((a) => a.includes('build-content-pack'));
  const rawArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
  const args = rawArgs.filter((a) => a !== '--');

  let dist = 'dist';
  let keyArg: string | undefined;
  let selftestDir: string | undefined;
  let outDir: string | undefined;
  let prune = false;
  let originArg: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dist' && args[i + 1]) {
      dist = args[++i];
    } else if (arg === '--key' && args[i + 1]) {
      keyArg = args[++i];
    } else if (arg === '--selftest' && args[i + 1]) {
      selftestDir = args[++i];
    } else if (arg === '--out' && args[i + 1]) {
      outDir = args[++i];
    } else if (arg === '--prune') {
      prune = true;
    } else if (arg === '--origin' && args[i + 1]) {
      originArg = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
构建期内容资产打包器 (Content Pack Builder)
用法:
  npm run content:pack -- --dist dist [--key <hex64>]
  npm run content:pack -- --selftest src-tauri/tests/fixtures

选项:
  --dist <dir>       vite build 产物目录 (默认: dist)
  --out <dir>        资产包与清单输出目录 (默认与 --dist 相同; 受保护发布流用 src-tauri/resources)
  --prune            打包并回读校验后, 从 dist 删除内容文件明文（受保护发布流必开）
  --origin <url>     受保护构建的内容协议源（缺省从产物 index.html 自动推断）
  --key <hex64>      内容主密钥（缺省依次取环境变量 / .security/content_master_key.hex / 自动生成）
  --selftest <dir>   生成跨语言格式契约 fixture（供 cargo 测试解密校验）
      `);
      return;
    }
  }

  try {
    if (selftestDir) {
      const fixture = buildSelftestFixture(selftestDir);
      console.log('[ContentPack] 跨语言契约 fixture 已生成:');
      console.log(`  pack:     ${path.join(selftestDir, 'content_pack_fixture.apack')} (${fixture.pack_sha256.slice(0, 16)}...)`);
      console.log(`  entries:  ${fixture.entries.map((e) => e.id).join(', ')}`);
      return;
    }

    const distDir = path.resolve(process.cwd(), dist);
    const targetDir = path.resolve(process.cwd(), outDir || dist);
    const keyHex = resolveMasterKeyHex(keyArg);
    const { pack, manifest } = buildContentPackForDist(
      distDir,
      Buffer.from(keyHex, 'hex'),
      originArg,
    );

    // 写盘前回读校验：索引条目数必须与清单一致
    const reparsed = parsePackIndex(pack);
    if (reparsed.length !== manifest.totalChunks) {
      throw new Error('资产包回读校验失败: 索引条目数不一致');
    }

    writeBundleOutputs(targetDir, keyHex, pack, manifest);

    console.log('======================================================');
    console.log('📦 [ContentPack] 内容资产包构建完成');
    console.log('======================================================');
    console.log(`🚀 启动引导文件 (明文保留): ${manifest.bootFiles.length} 个`);
    console.log(`🔒 内容文件 (已加密入包):   ${manifest.totalChunks} 个`);
    console.log(`📦 资产包大小:              ${(pack.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📋 输出目录:                ${path.relative(process.cwd(), targetDir)}`);
    console.log('------------------------------------------------------');

    if (prune) {
      const deleted = pruneContentFiles(distDir, manifest);
      console.log(`✂️  已从 dist 裁剪明文内容:   ${deleted.length} 个`);
    } else {
      console.log('⚠️  内容文件仍以明文并存于 dist（加 --prune 在打包校验后裁剪）。');
    }
    console.log('    资产包与主密钥请妥善保管，严禁将密钥材料提交入库。');
    console.log('======================================================');
  } catch (err: unknown) {
    console.error('❌ [ContentPack] 打包失败:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// CLI 入口（Vitest 环境不执行; 本文件不被其他脚本 import, 无副作用问题）
if (!process.env.VITEST) {
  runCli();
}
