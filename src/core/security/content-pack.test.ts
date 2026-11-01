import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  writeBundleOutputs,
  ASSET_PACK_MAGIC,
  ASSET_PACK_VERSION,
  NONCE_LEN,
  deterministicNonce,
  encryptChunk,
  decryptChunk,
  compileContentPack,
  parsePackIndex,
  deriveContentPackKey,
  parseIndexHtmlAssetRefs,
  extractStaticImports,
  collectStaticClosure,
  classifyDistFiles,
  buildContentPackForDist,
  buildSelftestFixture,
  resolveMasterKeyHex,
  SELFTEST_MASTER_KEY_HEX,
  CONTENT_PACK_KEY_INFO,
  type PackEntry,
  type PackManifest,
} from '../../../scripts/build-content-pack';

describe('build-content-pack (内容资产打包器 · ALGP v1)', () => {
  describe('deterministicNonce', () => {
    it('与 Rust 端公式一致: (i + j + id[j % idLen]) mod 256', () => {
      // entryIndex=0, id="assets/alpha.js": idBytes[0]='a'=97
      const n0 = deterministicNonce(0, 'assets/alpha.js');
      expect(n0.length).toBe(NONCE_LEN);
      expect(n0[0]).toBe(97);  // (0 + 0 + id[0]='a'=97) mod 256
      expect(n0[1]).toBe(116); // (0 + 1 + id[1]='s'=115) mod 256

      // entryIndex=2, id="b": idBytes[0]='b'=98 → nonce[0] = (2+0+98)=100
      const n1 = deterministicNonce(2, 'b');
      expect(n1[0]).toBe(100);

      // 索引超过 255 时 wrapping 截断
      const n2 = deterministicNonce(300, 'b');
      expect(n2[0]).toBe((300 + 98) & 0xff);
    });

    it('同 id 同索引输出确定，不同 id 产生差异', () => {
      expect(deterministicNonce(1, 'a.js')).toEqual(deterministicNonce(1, 'a.js'));
      expect(deterministicNonce(1, 'a.js')).not.toEqual(deterministicNonce(1, 'b.js'));
    });
  });

  describe('deriveContentPackKey', () => {
    it('与 Rust 端 HKDF 同参派生（域标签对齐）', () => {
      expect(CONTENT_PACK_KEY_INFO).toBe('algorithm-viz/content-pack-key-v1');
      const master = Buffer.alloc(32, 0x42);
      const k1 = deriveContentPackKey(master);
      const k2 = deriveContentPackKey(master);
      expect(k1.length).toBe(32);
      expect(k1.equals(k2)).toBe(true);
      // 1 位差异雪崩
      const mutated = Buffer.from(master);
      mutated[31] ^= 0x01;
      expect(deriveContentPackKey(mutated).equals(k1)).toBe(false);
    });

    it('拒绝非 32 字节主密钥', () => {
      expect(() => deriveContentPackKey(Buffer.alloc(16))).toThrow();
    });
  });

  describe('compileContentPack + parsePackIndex + decryptChunk', () => {
    const masterKey = Buffer.alloc(32, 0x11);
    const packKey = deriveContentPackKey(masterKey);
    const entries: PackEntry[] = [
      { id: 'assets/alpha.js', data: Buffer.from('export const ALPHA = 1;', 'utf8') },
      { id: 'pages/beta.js', data: Buffer.from('export default "beta";', 'utf8') },
    ];

    it('包头部字段与 ALGP v1 对齐', () => {
      const pack = compileContentPack(entries, packKey);
      expect(pack.subarray(0, 4).equals(ASSET_PACK_MAGIC)).toBe(true);
      expect(pack.readUInt32LE(4)).toBe(ASSET_PACK_VERSION);
      expect(pack.readUInt32LE(8)).toBe(2);
      const indexLen = pack.readUInt32LE(12);
      // 索引项 = 2 + idLen + 16
      const expectedIndexLen =
        2 + 'assets/alpha.js'.length + 16 + 2 + 'pages/beta.js'.length + 16;
      expect(indexLen).toBe(expectedIndexLen);
    });

    it('TS 自解密回读与 Rust 引擎共用同一格式', () => {
      const pack = compileContentPack(entries, packKey);
      const index = parsePackIndex(pack);
      expect(index.map((e) => e.id)).toEqual(['assets/alpha.js', 'pages/beta.js']);
      // 首块紧随头部，偏移单调衔接
      const indexLen = pack.readUInt32LE(12);
      expect(index[0].offset).toBe(16 + indexLen);
      expect(index[1].offset).toBe(index[0].offset + index[0].length);
      for (const item of index) {
        const chunk = pack.subarray(item.offset, item.offset + item.length);
        const plaintext = decryptChunk(packKey, chunk);
        const expected = entries.find((e) => e.id === item.id)!.data;
        expect(plaintext.equals(expected)).toBe(true);
      }
    });

    it('错误密钥解密必须失败（GCM Tag 校验）', () => {
      const pack = compileContentPack(entries, packKey);
      const index = parsePackIndex(pack);
      const wrongKey = Buffer.from(packKey);
      wrongKey[0] ^= 0xff;
      const chunk = pack.subarray(index[0].offset, index[0].offset + index[0].length);
      expect(() => decryptChunk(wrongKey, chunk)).toThrow();
    });

    it('重复 id 在构建端被拦截（Rust 端 HashMap 会静默覆盖）', () => {
      const dup: PackEntry[] = [
        { id: 'a.js', data: Buffer.from('1') },
        { id: 'a.js', data: Buffer.from('2') },
      ];
      expect(() => compileContentPack(dup, packKey)).toThrow('重复');
    });

    it('空条目被拦截', () => {
      expect(() => compileContentPack([], packKey)).toThrow();
    });
  });

  describe('静态闭包分类', () => {
    it('parseIndexHtmlAssetRefs 提取 index.html 本地引用', () => {
      const html = `<html><head>
        <link rel="icon" href="./favicon.ico">
        <link rel="stylesheet" crossorigin href="./assets/index-Css123.css">
        <script type="module" crossorigin src="./assets/index-Js123.js"></script>
        <script src="https://cdn.example.com/ext.js"></script>
      </head></html>`;
      // 引用已归一化为 dist 相对路径；外域 CDN 引用被跳过
      const refs = parseIndexHtmlAssetRefs(html);
      expect(refs).toEqual(['favicon.ico', 'assets/index-Css123.css', 'assets/index-Js123.js']);

      // 绝对 base（受保护构建）: 注入内容协议源后正确归一化
      const protectedHtml = `<html><head>
        <script type="module" crossorigin src="http://apv.localhost/assets/index-Ab12cd.js"></script>
        <link rel="stylesheet" href="http://apv.localhost/assets/index-Xy34zw.css">
        <script src="https://cdn.example.com/ext.js"></script>
      </head></html>`;
      expect(parseIndexHtmlAssetRefs(protectedHtml, 'http://apv.localhost/')).toEqual([
        'assets/index-Ab12cd.js',
        'assets/index-Xy34zw.css',
      ]);
      // 未提供 origin 时绝对 URL 一律跳过
      expect(parseIndexHtmlAssetRefs(protectedHtml)).toEqual([]);
    });

    it('extractStaticImports 区分静态 import 与动态 import', () => {
      const code = [
        'import"./assets/shared-1.js";',
        'import{open}from"./assets/lib-2.js";',
        'const lazy=()=>import("./assets/lazy-3.js");',
        'const m=await import("./assets/lazy-4.js");',
        'const deps=["./assets/preload-5.js","./assets/preload-6.css"];',
        'import x from "./assets/named-7.js";',
        'import"http://apv.localhost/assets/abs-8.js";',
      ].join('\n');
      const refs = extractStaticImports(code);
      // 原始 specifier（含受保护构建的绝对 URL 形态），归一化由闭包收集器完成
      expect(refs).toEqual([
        './assets/shared-1.js',
        './assets/lib-2.js',
        './assets/named-7.js',
        'http://apv.localhost/assets/abs-8.js',
      ]);
    });

    let tmpDir: string;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'algo_viz_dist_test_'));
    });
    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function writeDist(files: Record<string, string>): void {
      for (const [rel, content] of Object.entries(files)) {
        const abs = path.join(tmpDir, rel);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, content);
      }
    }

    it('闭包只含静态可达文件，动态 import 与预加载清单归入内容集合', () => {
      writeDist({
        'index.html':
          '<html><head><script type="module" crossorigin src="./assets/index-A.js"></script></head></html>',
        'assets/index-A.js':
          'import"./core-B.js";import"./core-B.css";const go=()=>import("./lazy-C.js");',
        'assets/core-B.js':
          'import{h}from"./util-D.js";const m=["./lazy-C.js","./lazy-C.css"];',
        'assets/core-B.css': '.b{color:red}',
        'assets/util-D.js': 'export const h=1;',
        'assets/lazy-C.js': 'export default 1;',
        'assets/lazy-C.css': '.c{}',
      });

      const closure = collectStaticClosure(tmpDir, ['index.html', './assets/index-A.js']);
      expect(closure.has('index.html')).toBe(true);
      expect(closure.has('assets/index-A.js')).toBe(true);
      expect(closure.has('assets/core-B.js')).toBe(true);
      expect(closure.has('assets/core-B.css')).toBe(true);
      expect(closure.has('assets/util-D.js')).toBe(true);
      // 动态 import 的 chunk 不在静态闭包内
      expect(closure.has('assets/lazy-C.js')).toBe(false);
      expect(closure.has('assets/lazy-C.css')).toBe(false);

      const { bootFiles, contentFiles } = classifyDistFiles(tmpDir);
      expect(bootFiles.sort()).toEqual(
        ['assets/core-B.css', 'assets/core-B.js', 'assets/index-A.js', 'assets/util-D.js', 'index.html'].sort(),
      );
      expect(contentFiles.sort()).toEqual(['assets/lazy-C.css', 'assets/lazy-C.js']);
    });
  });

  describe('buildContentPackForDist + selftest fixture', () => {
    let tmpDir: string;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'algo_viz_pack_test_'));
    });
    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('dist 打包回读：内容集合全量入包且可解密', () => {
      fs.mkdirSync(path.join(tmpDir, 'assets'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'index.html'),
        '<html><script type="module" src="./assets/index-A.js"></script></html>',
      );
      fs.writeFileSync(path.join(tmpDir, 'assets', 'index-A.js'), 'import"./core-B.js";');
      fs.writeFileSync(path.join(tmpDir, 'assets', 'core-B.js'), 'export const B=1;'.repeat(10));
      fs.writeFileSync(path.join(tmpDir, 'assets', 'lazy-C.js'), 'export default 2;');

      const masterKey = Buffer.alloc(32, 0x33);
      const { pack, manifest } = buildContentPackForDist(tmpDir, masterKey);
      expect(manifest.totalChunks).toBe(1);
      expect(manifest.contentFiles).toEqual(['assets/lazy-C.js']);
      expect(manifest.bootFiles).toContain('index.html');
      expect(manifest.contentSha256['assets/lazy-C.js']).toMatch(/^[0-9a-f]{64}$/);

      // 用 Rust 同款派生密钥解密回读
      const index = parsePackIndex(pack);
      const packKey = deriveContentPackKey(masterKey);
      const chunk = pack.subarray(index[0].offset, index[0].offset + index[0].length);
      expect(decryptChunk(packKey, chunk).toString('utf8')).toBe('export default 2;');
    });

    it('selftest fixture 字节级可复现（确定性 nonce + 固定密钥）', () => {
      const outDir = path.join(tmpDir, 'fx1');
      const f1 = buildSelftestFixture(outDir);
      const f2 = buildSelftestFixture(path.join(tmpDir, 'fx2'));
      expect(f1.pack_sha256).toBe(f2.pack_sha256);
      expect(f1.key_hex).toBe(SELFTEST_MASTER_KEY_HEX);
      expect(fs.existsSync(path.join(outDir, 'content_pack_fixture.apack'))).toBe(true);
      expect(f1.entries.map((e) => e.id)).toEqual(['assets/alpha.js', 'assets/beta.css', 'pages/gamma.js']);
    });

    it('writeBundleOutputs 三件套齐备（包 + 清单 + 主密钥）', () => {
      const outDir = path.join(tmpDir, 'bundle');
      const keyHex = SELFTEST_MASTER_KEY_HEX;
      const entries: PackEntry[] = [{ id: 'assets/x.js', data: Buffer.from('export default 1;') }];
      const pack = compileContentPack(entries, deriveContentPackKey(Buffer.from(keyHex, 'hex')));
      const manifest: PackManifest = {
        version: 1,
        createdAt: new Date().toISOString(),
        packFile: 'content.apack',
        bootFiles: ['index.html'],
        contentFiles: ['assets/x.js'],
        contentSha256: { 'assets/x.js': 'x'.repeat(64) },
        totalChunks: 1,
      };

      writeBundleOutputs(outDir, keyHex, pack, manifest);
      expect(fs.existsSync(path.join(outDir, 'content.apack'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'content-manifest.json'))).toBe(true);
      // 主密钥文件必须是 64 位 hex（运行时 parse_master_key_hex 可解析），杜绝占位符上生产
      const writtenKey = fs.readFileSync(path.join(outDir, 'content_master_key.hex'), 'utf8').trim();
      expect(writtenKey).toMatch(/^[0-9a-f]{64}$/);
      expect(writtenKey).toBe(keyHex);
    });

    it('resolveMasterKeyHex: 显式传入优先且校验格式', () => {
      const hex64 = SELFTEST_MASTER_KEY_HEX;
      expect(resolveMasterKeyHex(hex64)).toBe(hex64);
      expect(() => resolveMasterKeyHex('not-hex')).toThrow();
      expect(() => resolveMasterKeyHex('a3'.repeat(31))).toThrow();
    });
  });
});
