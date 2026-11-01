#!/usr/bin/env vite-node
/**
 * 受保护发布产物核验器 (Protected Build Verifier)
 *
 * 将真机验收清单中可机械化的部分自动化为一条命令：
 *   npm run verify:protected -- [--resources src-tauri/resources] [--dist dist]
 *                              [--exe src-tauri/target/release/algorithm-viz.exe]
 *                              [--samples 8]
 *
 * 核验项：
 *   1. 资源三件套齐备（content.apack / 清单 / 64 位 hex 主密钥）；
 *   2. 资产包回读：ALGP 魔数、索引条目数与清单一致；
 *   3. 抽样解密对账：随机抽取内容文件，用主密钥派生包密钥解密并比对 SHA-256；
 *   4. dist 裁剪核验：内容明文已删除、boot 引导文件齐备、base 指向内容协议源；
 *   5. exe 泄漏检查（可选）：讲义特征串与主密钥 hex 在二进制中零命中。
 *
 * Exit code 0 = 全部通过；1 = 存在问题（逐条列出）。
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  parsePackIndex,
  deriveContentPackKey,
  decryptChunk,
  inferContentOrigin,
  parseIndexHtmlAssetRefs,
  type PackManifest,
} from './content-pack-lib';

export interface CheckResult {
  name: string;
  ok: boolean;
  problems: string[];
}

/** 主密钥文件核验：64 位 hex（杜绝占位符上生产） */
export function checkKeyHex(raw: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(raw.trim());
}

/**
 * 解析核验用主密钥：显式 --key > 资源目录文件 > .security（开发者机）。
 * 密钥已改为二进制内嵌分发，资源目录文件只是可选兜底。
 */
export function resolveVerifyKey(resourcesDir: string, explicitKey?: string): string | null {
  if (explicitKey && checkKeyHex(explicitKey)) return explicitKey.trim();
  const resKey = path.join(resourcesDir, 'content_master_key.hex');
  if (fs.existsSync(resKey) && checkKeyHex(fs.readFileSync(resKey, 'utf8'))) {
    return fs.readFileSync(resKey, 'utf8').trim();
  }
  const secKey = path.resolve(process.cwd(), '.security', 'content_master_key.hex');
  if (fs.existsSync(secKey) && checkKeyHex(fs.readFileSync(secKey, 'utf8'))) {
    return fs.readFileSync(secKey, 'utf8').trim();
  }
  return null;
}

/** 资源核验：包 + 清单必须齐备；密钥文件已不随包分发，存在时仅校验格式 */
export function checkBundle(resourcesDir: string): CheckResult {
  const problems: string[] = [];
  const apackPath = path.join(resourcesDir, 'content.apack');
  const manifestPath = path.join(resourcesDir, 'content-manifest.json');
  const keyPath = path.join(resourcesDir, 'content_master_key.hex');

  if (!fs.existsSync(apackPath)) {
    problems.push('缺少 content.apack（未执行受保护发布流的打包步骤）');
  } else if (fs.statSync(apackPath).size < 1024) {
    problems.push('content.apack 过小，疑似占位文件');
  }
  if (!fs.existsSync(manifestPath)) {
    problems.push('缺少 content-manifest.json');
  }
  if (fs.existsSync(keyPath) && !checkKeyHex(fs.readFileSync(keyPath, 'utf8'))) {
    problems.push('content_master_key.hex 存在但不是合法 64 位 hex');
  }

  return { name: '资源核验（包 + 清单）', ok: problems.length === 0, problems };
}

/** 资产包回读 + 抽样解密对账（镜像 Rust 端契约，Node crypto 实现） */
export function verifyPackSamples(
  packPath: string,
  keyHex: string,
  manifest: PackManifest,
  sampleCount: number,
): CheckResult {
  const problems: string[] = [];
  const pack = fs.readFileSync(packPath);

  if (pack.subarray(0, 4).toString('ascii') !== 'ALGP') {
    problems.push('资产包 Magic 非法');
    return { name: '资产包回读与抽样对账', ok: false, problems };
  }

  const index = parsePackIndex(pack);
  if (index.length !== manifest.totalChunks) {
    problems.push(`索引条目数不一致: 包内 ${index.length} vs 清单 ${manifest.totalChunks}`);
  }

  const packKey = deriveContentPackKey(Buffer.from(keyHex, 'hex'));
  const byId = new Map(manifest.contentFiles.map((f) => [f, manifest.contentSha256[f]]));
  const step = Math.max(1, Math.floor(index.length / Math.max(1, sampleCount)));
  let sampled = 0;
  for (let i = 0; i < index.length && sampled < sampleCount; i += step) {
    const entry = index[i];
    const expected = byId.get(entry.id);
    if (expected === undefined) {
      problems.push(`包内条目 ${entry.id} 不在清单中`);
      continue;
    }
    try {
      const plaintext = decryptChunk(packKey, pack.subarray(entry.offset, entry.offset + entry.length));
      const sha = crypto.createHash('sha256').update(plaintext).digest('hex');
      if (sha !== expected) {
        problems.push(`条目 ${entry.id} 解密后 SHA-256 与清单不一致`);
      }
    } catch (err) {
      problems.push(`条目 ${entry.id} 解密失败: ${err instanceof Error ? err.message : String(err)}`);
    }
    sampled += 1;
  }
  if (sampled === 0) {
    problems.push('清单为空或抽样窗口为 0');
  }

  return { name: '资产包回读与抽样对账', ok: problems.length === 0, problems };
}

/** dist 裁剪核验：内容明文已删、boot 齐备、base 指向内容协议源 */
export function checkDistPruned(distDir: string, manifest: PackManifest, contentOrigin?: string): CheckResult {
  const problems: string[] = [];

  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    problems.push('dist/index.html 不存在（请先受保护构建）');
    return { name: 'dist 裁剪核验', ok: false, problems };
  }

  let leaked = 0;
  for (const rel of manifest.contentFiles) {
    if (fs.existsSync(path.join(distDir, rel))) {
      leaked += 1;
      if (leaked <= 5) problems.push(`内容明文未裁剪: ${rel}`);
    }
  }
  if (leaked > 5) {
    problems.push(`……共 ${leaked} 个内容明文残留`);
  }

  for (const rel of manifest.bootFiles) {
    if (!fs.existsSync(path.join(distDir, rel))) {
      problems.push(`boot 引导文件缺失: ${rel}`);
    }
  }

  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const inferred = inferContentOrigin(indexHtml);
  if (!inferred) {
    problems.push('index.html 未引用内容协议源（base 未切换，疑似普通构建产物）');
  } else if (contentOrigin && inferred.replace(/\/+$/, '').toLowerCase() !== contentOrigin.replace(/\/+$/, '').toLowerCase()) {
    problems.push(`内容协议源不匹配: 产物 ${inferred} vs 预期 ${contentOrigin}`);
  }

  return { name: 'dist 裁剪核验', ok: problems.length === 0, problems };
}

/** exe 泄漏检查：讲义特征串与主密钥 hex 在二进制中零命中 */
export function checkExePlaintext(exePath: string, keyHex: string, probes: string[]): CheckResult {
  const problems: string[] = [];
  if (!fs.existsSync(exePath)) {
    return { name: 'exe 泄漏检查', ok: true, problems: ['（未提供 exe，跳过）'] };
  }

  const binary = fs.readFileSync(exePath);
  const needles: Array<[string, string]> = [
    ...probes.map((p) => [p, '讲义特征串'] as [string, string]),
    [keyHex.toLowerCase(), '主密钥 hex'],
    [keyHex.toUpperCase(), '主密钥 hex'],
  ];

  for (const [needle, kind] of needles) {
    const buf = Buffer.from(needle, 'utf8');
    if (binary.indexOf(buf) !== -1) {
      problems.push(`检测到 ${kind} 泄漏进 exe: ${needle.slice(0, 24)}...`);
    }
  }

  return { name: 'exe 泄漏检查', ok: problems.length === 0, problems };
}

export interface VerificationOptions {
  resourcesDir: string;
  distDir: string;
  exePath?: string;
  origin?: string;
  samples?: number;
  /** 讲义特征串探针（从产物中不应出现的文本） */
  probes?: string[];
  /** 显式主密钥（缺省依次取资源目录文件 / .security） */
  keyHex?: string;
}

export function runVerification(options: VerificationOptions): { ok: boolean; results: CheckResult[] } {
  const results: CheckResult[] = [];

  const bundle = checkBundle(options.resourcesDir);
  results.push(bundle);

  let keyHex = '';
  let manifest: PackManifest | null = null;
  if (bundle.ok) {
    const resolvedKey = resolveVerifyKey(options.resourcesDir, options.keyHex);
    if (!resolvedKey) {
      results.push({
        name: '主密钥解析',
        ok: false,
        problems: ['无法解析主密钥（--key / 资源目录 / .security 均无）'],
      });
      return { ok: false, results };
    }
    keyHex = resolvedKey;
    manifest = JSON.parse(
      fs.readFileSync(path.join(options.resourcesDir, 'content-manifest.json'), 'utf8'),
    ) as PackManifest;
    results.push(verifyPackSamples(
      path.join(options.resourcesDir, 'content.apack'),
      keyHex,
      manifest,
      options.samples ?? 8,
    ));
  }

  if (manifest) {
    results.push(checkDistPruned(options.distDir, manifest, options.origin));
    if (options.exePath) {
      results.push(checkExePlaintext(
        options.exePath,
        keyHex,
        options.probes ?? ['中序遍历', '递归调用栈', '动态规划转移方程'],
      ));
    }
  }

  return { ok: results.every((r) => r.ok), results };
}

export function runCli(): void {
  const scriptIdx = process.argv.findIndex((a) => a.includes('verify-protected-build'));
  const rawArgs = scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : process.argv.slice(2);
  const args = rawArgs.filter((a) => a !== '--');

  let resourcesDir = 'src-tauri/resources';
  let distDir = 'dist';
  let exePath: string | undefined;
  let origin: string | undefined;
  let samples = 8;
  let keyHex: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--resources' && args[i + 1]) resourcesDir = args[++i];
    else if (arg === '--dist' && args[i + 1]) distDir = args[++i];
    else if (arg === '--exe' && args[i + 1]) exePath = args[++i];
    else if (arg === '--origin' && args[i + 1]) origin = args[++i];
    else if (arg === '--samples' && args[i + 1]) samples = parseInt(args[++i], 10);
    else if (arg === '--key' && args[i + 1]) keyHex = args[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log(`
受保护发布产物核验器 (Protected Build Verifier)
用法:
  npm run verify:protected -- [--resources src-tauri/resources] [--dist dist]
                              [--exe <exe 路径>] [--origin <url>] [--samples 8]

默认使用内置讲义特征探针（中序遍历 / 递归调用栈 / 动态规划转移方程）做 exe 泄漏检查。
      `);
      return;
    }
  }

  const { ok, results } = runVerification({
    resourcesDir: path.resolve(process.cwd(), resourcesDir),
    distDir: path.resolve(process.cwd(), distDir),
    exePath: exePath ? path.resolve(process.cwd(), exePath) : undefined,
    origin,
    samples,
    keyHex,
  });

  console.log('======================================================');
  console.log('🔍 [Verify Protected] 受保护产物核验报告');
  console.log('======================================================');
  for (const r of results) {
    const mark = r.ok ? '✅' : '❌';
    console.log(`${mark} ${r.name}`);
    for (const p of r.problems) {
      console.log(`     - ${p}`);
    }
  }
  console.log('======================================================');
  if (ok) {
    console.log('✅ 全部核验通过。剩余人工项见 docs/security-operations.md 第四节。');
  } else {
    console.error('❌ 核验未通过，禁止对外分发该产物。');
    process.exit(1);
  }
}

// CLI 入口（Vitest 环境不执行; 本文件不被其他脚本 import, 无副作用问题）
if (!process.env.VITEST) {
  runCli();
}
