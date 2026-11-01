/**
 * 构建期内容资产打包器 (Content Pack Builder)
 *
 * 职责（内容资产加密管线 · 构建端）：
 * 1. 将 dist 构建产物划分为「启动引导集合」（index.html + 静态 import 闭包，
 *    含激活弹窗等授权 UI）与「内容集合」（其余全部 JS/CSS 资产，即 658 道算法
 *    渲染器与讲义数据所在）；
 * 2. 用 AES-256-GCM 将内容集合逐文件加密，编译为 ALGP v1 资产包
 *    （与 Rust 端 `stream_decrypt.rs` 的 StreamDecryptEngine 字节格式逐字段对齐），
 *    输出 `content.apack` + `content-manifest.json`；
 * 3. `--selftest` 模式生成跨语言契约 fixture（固定测试密钥 + 固定条目），
 *    由 Rust 端 cargo 测试解密验证，锁定两端格式永不错位。
 *
 * 密钥分层（与 content_pack_key.rs 对齐）：资产包以构建期主密钥加密（共享包，
 * 全用户通用）；机器与授权绑定在 Rust 服务门禁层（fetch 前强制验签 + 机器指纹）。
 * 主密钥通过 `--key` / 环境变量 `ALGO_VIZ_CONTENT_MASTER_KEY` / `.security/`
 * 持久化文件三选一解析，生产构建务必显式指定并妥善保管。
 *
 * 用法：
 *   npm run content:pack -- --dist dist [--key <hex64>]
 *   npm run content:pack -- --selftest src-tauri/tests/fixtures
 * 本文件为纯函数库（无 CLI 副作用）；CLI 见 build-content-pack.ts。
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// ALGP v1 格式常量（与 src-tauri/src/security/stream_decrypt.rs 逐字段对齐）
// ============================================================

export const ASSET_PACK_MAGIC = Buffer.from('ALGP', 'ascii');
export const ASSET_PACK_VERSION = 1;
export const NONCE_LEN = 12;

export interface PackEntry {
  /** 包内唯一标识（dist 相对 POSIX 路径，如 assets/main-AbCdEf.js） */
  id: string;
  data: Buffer;
}

/**
 * 确定性 Nonce 派生（Rust 端 AssetPackCompiler 同款）：
 * nonce[j] = (entryIndex + j + idBytes[j % idLen]) mod 256
 */
export function deterministicNonce(entryIndex: number, id: string): Buffer {
  const idBytes = Buffer.from(id, 'utf8');
  const nonce = Buffer.alloc(NONCE_LEN);
  for (let j = 0; j < NONCE_LEN; j++) {
    nonce[j] = (entryIndex + j + (idBytes[j % idBytes.length] ?? 0)) & 0xff;
  }
  return nonce;
}

/** HKDF 域隔离标签（与 Rust content_pack_key.rs 的 CONTENT_PACK_KEY_INFO 对齐） */
export const CONTENT_PACK_KEY_INFO = 'algorithm-viz/content-pack-key-v1';

/**
 * 从构建期主密钥派生资产包 AES 密钥（与 Rust derive_content_pack_key 完全同参）：
 * HKDF-SHA256(ikm=master, salt=32 字节零 (RFC 5869 缺省 salt), info=域标签)
 */
export function deriveContentPackKey(masterKey: Buffer): Buffer {
  if (masterKey.length !== 32) {
    throw new Error('内容主密钥必须为 32 字节');
  }
  const okm = crypto.hkdfSync('sha256', masterKey, Buffer.alloc(32), Buffer.from(CONTENT_PACK_KEY_INFO, 'utf8'), 32);
  return Buffer.from(okm);
}

/** AES-256-GCM 加密单片，输出 [nonce(12B)][ciphertext+tag] */
export function encryptChunk(cipherKey: Buffer, nonce: Buffer, plaintext: Buffer): Buffer {
  if (cipherKey.length !== 32) {
    throw new Error('AES-256-GCM 密钥必须为 32 字节');
  }
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ciphertext, tag]);
}

/**
 * 编译 ALGP v1 资产包：
 * [Magic(4)][Version u32le][TotalCount u32le][IndexLen u32le][索引表][数据区]
 * 索引项: [idLen u16le][id][offset u64le][length u64le]
 * 数据区单片: [nonce(12B)][ciphertext+tag]
 */
export function compileContentPack(entries: PackEntry[], cipherKey: Buffer): Buffer {
  if (entries.length === 0) {
    throw new Error('资产包至少需要 1 个条目');
  }
  // id 唯一性校验（Rust 端 HashMap 索引会静默覆盖重复 id，必须在构建端拦截）
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.id)) {
      throw new Error(`资产包条目 id 重复: ${e.id}`);
    }
    seen.add(e.id);
  }

  const encrypted = entries.map((e, i) => ({
    id: e.id,
    chunk: encryptChunk(cipherKey, deterministicNonce(i, e.id), e.data),
  }));

  const indexLen = encrypted.reduce((acc, e) => acc + 2 + Buffer.byteLength(e.id, 'utf8') + 16, 0);
  const headerSize = 4 + 4 + 4 + 4 + indexLen;

  const indexBuf = Buffer.alloc(indexLen);
  let idxOff = 0;
  let dataOff = headerSize;
  const dataParts: Buffer[] = [];
  for (const e of encrypted) {
    const idB = Buffer.from(e.id, 'utf8');
    indexBuf.writeUInt16LE(idB.length, idxOff);
    idxOff += 2;
    idB.copy(indexBuf, idxOff);
    idxOff += idB.length;
    indexBuf.writeBigUInt64LE(BigInt(dataOff), idxOff);
    idxOff += 8;
    indexBuf.writeBigUInt64LE(BigInt(e.chunk.length), idxOff);
    idxOff += 8;
    dataParts.push(e.chunk);
    dataOff += e.chunk.length;
  }

  const header = Buffer.alloc(16);
  ASSET_PACK_MAGIC.copy(header, 0);
  header.writeUInt32LE(ASSET_PACK_VERSION, 4);
  header.writeUInt32LE(encrypted.length, 8);
  header.writeUInt32LE(indexLen, 12);

  return Buffer.concat([header, indexBuf, ...dataParts]);
}

/** 用 node crypto 解密单片（自校验回读用） */
export function decryptChunk(cipherKey: Buffer, chunk: Buffer): Buffer {
  const nonce = chunk.subarray(0, NONCE_LEN);
  const ciphertext = chunk.subarray(NONCE_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', cipherKey, nonce);
  decipher.setAuthTag(ciphertext.subarray(ciphertext.length - 16));
  return Buffer.concat([
    decipher.update(ciphertext.subarray(0, ciphertext.length - 16)),
    decipher.final(),
  ]);
}

/** 解析 ALGP v1 包头部与索引（不解密数据区） */
export function parsePackIndex(pack: Buffer): Array<{ id: string; offset: number; length: number }> {
  if (pack.length < 16 || !pack.subarray(0, 4).equals(ASSET_PACK_MAGIC)) {
    throw new Error('资产包 Magic 非法');
  }
  const version = pack.readUInt32LE(4);
  if (version !== ASSET_PACK_VERSION) {
    throw new Error(`不支持的资产包版本: ${version}`);
  }
  const count = pack.readUInt32LE(8);
  const indexLen = pack.readUInt32LE(12);
  let idxOff = 16;
  const entries: Array<{ id: string; offset: number; length: number }> = [];
  for (let i = 0; i < count; i++) {
    const idLen = indexBufReadU16(pack, idxOff);
    idxOff += 2;
    const id = pack.subarray(idxOff, idxOff + idLen).toString('utf8');
    idxOff += idLen;
    const offset = Number(pack.readBigUInt64LE(idxOff));
    idxOff += 8;
    const length = Number(pack.readBigUInt64LE(idxOff));
    idxOff += 8;
    entries.push({ id, offset, length });
  }
  if (idxOff - 16 !== indexLen) {
    throw new Error('索引表长度与声明不符');
  }
  return entries;
}

function indexBufReadU16(buf: Buffer, off: number): number {
  return buf.readUInt16LE(off);
}

// ============================================================
// dist 分类：启动引导集合 vs 内容集合
// ============================================================

/**
 * 将资产引用归一化为 dist 相对路径；无法识别的引用（外域 / data: 等）返回 null 跳过
 *
 * 兼容三种产物形态：
 * - 相对 base: `./assets/x.js` / `assets/x.js`
 * - 根相对:    `/assets/x.js`
 * - 绝对 base（受保护构建）: `http://apv.localhost/assets/x.js`
 */
export function normalizeAssetRef(ref: string, contentOrigin?: string): string | null {
  if (/^(data:|blob:|mailto:|javascript:)/i.test(ref)) return null;
  if (/^https?:\/\//i.test(ref)) {
    if (!contentOrigin) return null;
    const o = contentOrigin.replace(/\/+$/, '');
    if (ref.toLowerCase().startsWith(o.toLowerCase() + '/')) {
      return ref.slice(o.length + 1);
    }
    return null;
  }
  if (ref.startsWith('/')) return ref.slice(1);
  if (ref.startsWith('./')) return ref.slice(2);
  if (ref.startsWith('../')) return null;
  return ref;
}

/** 从 index.html 提取资产引用（兼容相对 / 根相对 / 绝对 base 三种产物形态） */
export function parseIndexHtmlAssetRefs(html: string, contentOrigin?: string): string[] {
  const refs: string[] = [];
  const tagRe = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    const normalized = normalizeAssetRef(m[1], contentOrigin);
    if (normalized) refs.push(normalized);
  }
  return refs;
}

/**
 * 提取 ESM 静态 import 路径：
 * - 匹配 `import"./x.js"` / `import "./x.js"` / `from"./x.js"` / `from "./x.js"`
 * - 排除动态 `import("./x.js")`（前瞻阻断 `\s*\(`）
 * - Vite 预加载清单 `__vite__mapDeps` 中的裸字符串路径不会被匹配（前面无 import/from）
 */
export function extractStaticImports(code: string): string[] {
  const refs: string[] = [];
  const re = /\b(?:import(?!\s*\()|from)\s*(["'])([^"']+)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    refs.push(m[2]);
  }
  return refs;
}

function toDistRelative(distRoot: string, baseDir: string, ref: string): string {
  const abs = path.resolve(baseDir, ref);
  return path.relative(distRoot, abs).split(path.sep).join('/');
}

/**
 * 从种子文件出发，沿静态 import 边收集传递闭包（dist 相对 POSIX 路径）
 */
export function collectStaticClosure(
  distDir: string,
  seeds: string[],
  contentOrigin?: string,
): Set<string> {
  const distRoot = path.resolve(distDir);
  const closure = new Set<string>();
  const queue: string[] = [];

  // 引用入队统一出口：
  // - 绝对 URL 且属于内容协议源 → 截取 origin 后为 dist 相对路径
  // - 根相对 `/x` → dist 相对路径
  // - 其余（./x、../x、裸相对）→ 相对引用方文件所在目录解析（chunk 间兄弟引用）
  const push = (raw: string, baseDir: string): void => {
    if (/^(data:|blob:|mailto:|javascript:)/i.test(raw)) return;
    if (/^https?:\/\//i.test(raw)) {
      if (!contentOrigin) return;
      const o = contentOrigin.replace(/\/+$/, '');
      if (!raw.toLowerCase().startsWith(o.toLowerCase() + '/')) return;
      queue.push(raw.slice(o.length + 1));
      return;
    }
    if (raw.startsWith('/')) {
      queue.push(raw.slice(1));
      return;
    }
    queue.push(toDistRelative(distRoot, baseDir, raw));
  };

  // 种子统一归一化（index.html 级引用相对 dist 根）
  for (const seed of seeds) {
    const normalized = normalizeAssetRef(seed, contentOrigin);
    if (normalized) queue.push(normalized);
  }

  while (queue.length > 0) {
    const rel = queue.pop() as string;
    if (closure.has(rel)) continue;
    const abs = path.join(distRoot, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    closure.add(rel);

    if (/\.(js|mjs)$/i.test(rel)) {
      const code = fs.readFileSync(abs, 'utf8');
      const baseDir = path.dirname(abs);
      for (const raw of extractStaticImports(code)) {
        push(raw, baseDir);
      }
    }
  }
  return closure;
}

function walkFiles(dir: string, rootDir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      out.push(...walkFiles(abs, rootDir));
    } else {
      out.push(path.relative(rootDir, abs).split(path.sep).join('/'));
    }
  }
  return out;
}

export interface DistClassification {
  allFiles: string[];
  /** 留在 dist 明文的启动引导集合（index.html + 静态闭包） */
  bootFiles: string[];
  /** 需要打入资产包的内容文件（dist 相对路径 = 包内 id） */
  contentFiles: string[];
}

/** 从产物 index.html 自动推断内容协议源（受保护构建的绝对 base） */
export function inferContentOrigin(indexHtml: string): string | undefined {
  // 收集全部绝对 URL 的源，取「引用路径含 /assets/ 特征」的那个
  // （外链 CDN 如 cdnjs 的路径为 ajax/libs/...，据此排除）
  const origins = new Set<string>();
  const re = /(?:src|href)\s*=\s*["'](https?:\/\/[^/'"\s]+)\//gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(indexHtml)) !== null) {
    origins.add(m[1].toLowerCase());
  }
  for (const o of origins) {
    if (indexHtml.toLowerCase().includes(`${o}/assets/`)) {
      return `${o}/`;
    }
  }
  return undefined;
}

export function classifyDistFiles(distDir: string, contentOrigin?: string): DistClassification {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`未找到 ${indexHtmlPath}，请先执行 vite build`);
  }
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const origin = contentOrigin ?? inferContentOrigin(indexHtml);
  const seeds = parseIndexHtmlAssetRefs(indexHtml, origin);
  const closure = collectStaticClosure(distDir, ['index.html', ...seeds], origin);

  const allFiles = walkFiles(distDir, distDir);
  const PACK_OUTPUTS = new Set(['content.apack', 'content-manifest.json']);
  const bootFiles = allFiles.filter((f) => closure.has(f));
  const contentFiles = allFiles.filter((f) => !closure.has(f) && !PACK_OUTPUTS.has(f));
  return { allFiles, bootFiles, contentFiles };
}

export interface PackManifest {
  version: number;
  createdAt: string;
  packFile: string;
  bootFiles: string[];
  contentFiles: string[];
  contentSha256: Record<string, string>;
  totalChunks: number;
}

/**
 * 对 dist 执行分类 + 打包，返回资产包字节与清单（不落盘）
 */
export function buildContentPackForDist(
  distDir: string,
  masterKey: Buffer,
  contentOrigin?: string,
): { pack: Buffer; manifest: PackManifest } {
  const cipherKey = deriveContentPackKey(masterKey);
  const { bootFiles, contentFiles } = classifyDistFiles(distDir, contentOrigin);
  if (contentFiles.length === 0) {
    throw new Error('内容集合为空：dist 中除启动闭包外没有可打包文件');
  }

  const entries: PackEntry[] = contentFiles.map((rel) => ({
    id: rel,
    data: fs.readFileSync(path.join(distDir, rel)),
  }));
  const pack = compileContentPack(entries, cipherKey);

  const contentSha256: Record<string, string> = {};
  for (const e of entries) {
    contentSha256[e.id] = crypto.createHash('sha256').update(e.data).digest('hex');
  }

  const manifest: PackManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    packFile: 'content.apack',
    bootFiles,
    contentFiles,
    contentSha256,
    totalChunks: entries.length,
  };
  return { pack, manifest };
}

/**
 * 受保护发布三件套落盘：资产包 + 清单 + 主密钥文件
 * （主密钥文件缺失时运行时管线休眠，安装包内容将全部 404——三件套必须同目录齐备）
 */
export function writeBundleOutputs(
  targetDir: string,
  keyHex: string,
  pack: Buffer,
  manifest: PackManifest,
): void {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'content.apack'), pack);
  fs.writeFileSync(path.join(targetDir, 'content-manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(targetDir, 'content_master_key.hex'), `${keyHex}
`);
}

/**
 * 从 dist 裁剪已入包的内容文件明文（仅在资产包写盘并回读验证后调用）
 * @returns 实际删除的文件列表
 */
export function pruneContentFiles(distDir: string, manifest: PackManifest): string[] {
  const deleted: string[] = [];
  for (const rel of manifest.contentFiles) {
    const abs = path.join(distDir, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs);
      deleted.push(rel);
    }
  }
  return deleted;
}

// ============================================================
// 主密钥解析
// ============================================================

export function resolveMasterKeyHex(explicitKey?: string): string {
  if (explicitKey) {
    if (!/^[0-9a-fA-F]{64}$/.test(explicitKey.trim())) {
      throw new Error('--key 必须是 64 位 hex（32 字节）');
    }
    return explicitKey.trim();
  }
  if (process.env.ALGO_VIZ_CONTENT_MASTER_KEY) {
    const envKey = process.env.ALGO_VIZ_CONTENT_MASTER_KEY.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(envKey)) {
      throw new Error('环境变量 ALGO_VIZ_CONTENT_MASTER_KEY 必须是 64 位 hex');
    }
    return envKey;
  }

  const secDir = path.join(process.cwd(), '.security');
  const keyPath = path.join(secDir, 'content_master_key.hex');
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8').trim();
  }
  fs.mkdirSync(secDir, { recursive: true });
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(keyPath, generated);
  console.log(`[ContentPack] 已生成新的内容主密钥并写入 ${keyPath}（请妥善备份）`);
  return generated;
}

// ============================================================
// 跨语言格式契约 fixture（固定测试密钥 + 确定性 nonce → 字节级可复现）
// ============================================================

/** 跨语言契约 fixture 专用固定测试密钥（仅测试，严禁生产使用） */
export const SELFTEST_MASTER_KEY_HEX = 'a3'.repeat(32);

export interface SelftestFixture {
  /** snake_case 字段名与 Rust 端 serde 反序列化对齐 */
  key_hex: string;
  pack_sha256: string;
  entries: Array<{ id: string; sha256: string; bytes: number }>;
}

/**
 * 生成跨语言契约 fixture：固定条目 + 固定密钥 → 字节级可复现，
 * 由 Rust 端 cargo 测试读取并解密，锁定 TS/Rust 两端格式永不错位
 */
export function buildSelftestFixture(outDir: string): SelftestFixture {
  const entries: PackEntry[] = [
    { id: 'assets/alpha.js', data: Buffer.from('export const ALPHA = 1;\n', 'utf8') },
    { id: 'assets/beta.css', data: Buffer.from('.beta { color: #38bdf8; }\n', 'utf8') },
    {
      id: 'pages/gamma.js',
      data: Buffer.from('export default "gamma-content-γγγ";\n', 'utf8'),
    },
  ];
  const packKey = deriveContentPackKey(Buffer.from(SELFTEST_MASTER_KEY_HEX, 'hex'));
  const pack = compileContentPack(entries, packKey);

  fs.mkdirSync(outDir, { recursive: true });
  const packPath = path.join(outDir, 'content_pack_fixture.apack');
  fs.writeFileSync(packPath, pack);

  const fixture: SelftestFixture = {
    key_hex: SELFTEST_MASTER_KEY_HEX,
    pack_sha256: crypto.createHash('sha256').update(pack).digest('hex'),
    entries: entries.map((e) => ({
      id: e.id,
      sha256: crypto.createHash('sha256').update(e.data).digest('hex'),
      bytes: e.data.length,
    })),
  };
  fs.writeFileSync(path.join(outDir, 'content_pack_fixture.json'), JSON.stringify(fixture, null, 2));
  return fixture;
}
