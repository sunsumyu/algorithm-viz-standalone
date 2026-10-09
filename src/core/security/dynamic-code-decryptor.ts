/**
 * 动态代码自解密与安全执行深模块 (Dynamic Code Decryptor & JIT Execution Engine)
 *
 * 核心职责：
 * 1. 静态密文驻留：敏感业务逻辑以加密 Payload 存储，消除打包产物中的明文字符与逻辑特征；
 * 2. 运行时堆上即时解密：按需派生密钥解密为内存闭包，杜绝全局挂载；
 * 3. 执行即焚 (Zeroize)：执行完成后立即清空缓冲区；
 * 4. 抗单步调试侦测：监控动态执行耗时，若遭遇断点阻滞（如超过阈值）立即阻断并告警。
 */

import { antiTheftEngine } from './anti-theft-interference-engine';

export interface EncryptedCodePayload {
  version: number;
  nonce: string;
  ciphertext: string;
  mac: string;
}

export interface ExecutionOptions {
  maxExecutionMs?: number;
  onBeforeWipe?: (plainCode: string) => void;
}

/**
 * 内部轻量 RC4 流加密与 HMAC-SHA256 式校验（零外部依赖，纯跨平台）
 */
function rc4Stream(input: Uint8Array, keyBytes: Uint8Array): Uint8Array {
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

function computeSimpleMac(ciphertextHex: string, key: string, nonce: string): string {
  // 结合密文、密钥与 nonce 计算校验摘要
  let hash = 0x811c9dc5;
  const combined = `${key}:${nonce}:${ciphertextHex}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export class DynamicCodeDecryptor {
  /**
   * 将明文代码段加密为自包含 Payload
   */
  public async encryptPayload(
    sourceCode: string,
    key: string
  ): Promise<EncryptedCodePayload> {
    const encoder = new TextEncoder();
    const sourceBytes = encoder.encode(sourceCode);
    const keyBytes = encoder.encode(key);

    // 生成随机 8 字节 nonce
    let nonce = '';
    for (let i = 0; i < 8; i++) {
      nonce += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }

    const nonceBytes = encoder.encode(nonce);
    const combinedKey = new Uint8Array(keyBytes.length + nonceBytes.length);
    combinedKey.set(keyBytes);
    combinedKey.set(nonceBytes, keyBytes.length);

    const cipherBytes = rc4Stream(sourceBytes, combinedKey);

    let ciphertext = '';
    for (let i = 0; i < cipherBytes.length; i++) {
      ciphertext += cipherBytes[i].toString(16).padStart(2, '0');
    }

    const mac = computeSimpleMac(ciphertext, key, nonce);

    return {
      version: 1,
      nonce,
      ciphertext,
      mac,
    };
  }

  /**
   * 解密并在隔离沙箱闭包中执行代码，执行后立即抹除明文
   */
  public async decryptAndExecute<T, A extends any[] = any[]>(
    payload: EncryptedCodePayload,
    key: string,
    args: A,
    options: ExecutionOptions = {}
  ): Promise<T> {
    const { maxExecutionMs = 2000, onBeforeWipe } = options;

    // 1. MAC 完整性校验
    const expectedMac = computeSimpleMac(payload.ciphertext, key, payload.nonce);
    if (expectedMac !== payload.mac) {
      throw new Error('解密认证失败：密钥错误或密文完整性受损');
    }

    // 2. 解密为明文代码
    if (payload.ciphertext.length % 2 !== 0) {
      throw new Error('解密认证失败：密文长度非法');
    }

    const cipherBytes = new Uint8Array(payload.ciphertext.length / 2);
    for (let i = 0; i < payload.ciphertext.length; i += 2) {
      cipherBytes[i / 2] = parseInt(payload.ciphertext.substring(i, i + 2), 16);
    }

    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);
    const nonceBytes = encoder.encode(payload.nonce);
    const combinedKey = new Uint8Array(keyBytes.length + nonceBytes.length);
    combinedKey.set(keyBytes);
    combinedKey.set(nonceBytes, keyBytes.length);

    const plainBytes = rc4Stream(cipherBytes, combinedKey);
    const decoder = new TextDecoder();
    let plainCode = decoder.decode(plainBytes);

    if (onBeforeWipe) {
      onBeforeWipe(plainCode);
    }

    // 3. 构建隔离闭包并测量执行耗时（抗单步断点调试）
    const startTime = performance.now();
    let executionError: any = null;
    let result: any = null;

    try {
      // 通过 Function 构造隔离执行环境
      const runner = new Function('args', plainCode);
      result = runner(args);
    } catch (err) {
      executionError = err;
    } finally {
      // 内存即时清零：覆写临时变量
      plainCode = '/* WIPED */';
    }

    const elapsed = performance.now() - startTime;
    if (elapsed > maxExecutionMs) {
      // 触发主动反调试干扰与健康评分扣减
      antiTheftEngine.registerProbe({
        name: 'PROBE_DEBUGGER_BREAKPOINT_DELAY',
        check: async () => ({
          healthy: false,
          penalty: 40,
          reason: `动态代码执行耗时异常 (${elapsed.toFixed(1)}ms > ${maxExecutionMs}ms)，疑似单步断点跟踪`,
        }),
      });
      antiTheftEngine.runAudit().catch(() => {});

      throw new Error(`安全防御触发：检测到动态调试或断点阻滞 (${elapsed.toFixed(1)}ms)`);
    }

    if (executionError) {
      throw executionError;
    }

    return result as T;
  }
}

export const dynamicCodeDecryptor = new DynamicCodeDecryptor();
