/**
 * 前端运行时字符串对称混淆与动态解密深模块 (String Obfuscator)
 *
 * 职责：
 * 1. 在生产构建与安全通讯中，防止核心敏感字符串（如 IPC channel 名、错误提示、防篡改签名）以明文形式出现在 bundle 中；
 * 2. 基于轻量 RC4 流密码对字符串进行快速动态加解密，内存即解即用；
 * 3. 零第三方依赖，杜绝大型 AST 混淆工具导致的内存溢出与构建卡顿。
 */

const DEFAULT_OBFUSCATION_KEY = 'algo-viz-drm-salt-2026';

/**
 * RC4 密钥流生成与异或转换
 */
function rc4Transform(input: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyBytes[i % keyBytes.length]) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }

  let i = 0;
  j = 0;
  const output = new Uint8Array(input.length);
  for (let k = 0; k < input.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    const keyStream = s[(s[i] + s[j]) % 256];
    output[k] = input[k] ^ keyStream;
  }

  return output;
}

/**
 * 将明文字符串加密为十六进制混淆字符串
 * @param plainText 原始明文
 * @param key 加密密钥（可选，默认使用内置安全盐）
 */
export function obfuscateString(plainText: string, key = DEFAULT_OBFUSCATION_KEY): string {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(plainText);
  const keyBytes = encoder.encode(key);
  const cipherBytes = rc4Transform(inputBytes, keyBytes);

  let hex = '';
  for (let i = 0; i < cipherBytes.length; i++) {
    hex += cipherBytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * 将十六进制混淆字符串动态解密为明文字符串
 * @param cipherHex 十六进制密文
 * @param key 解密密钥（需与加密密钥一致）
 */
export function deobfuscateString(cipherHex: string, key = DEFAULT_OBFUSCATION_KEY): string {
  if (!cipherHex || cipherHex.length % 2 !== 0) {
    return '';
  }

  const cipherBytes = new Uint8Array(cipherHex.length / 2);
  for (let i = 0; i < cipherHex.length; i += 2) {
    cipherBytes[i / 2] = parseInt(cipherHex.substring(i, i + 2), 16);
  }

  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);
  const plainBytes = rc4Transform(cipherBytes, keyBytes);

  const decoder = new TextDecoder();
  return decoder.decode(plainBytes);
}

/**
 * 便捷包装器：安全敏感常量动态访问器（解密后即用即焚）
 */
export function secureString(cipherHex: string, key?: string): string {
  return deobfuscateString(cipherHex, key);
}
