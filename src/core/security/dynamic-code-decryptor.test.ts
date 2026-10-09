// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DynamicCodeDecryptor,
  type EncryptedCodePayload,
} from './dynamic-code-decryptor';

describe('DynamicCodeDecryptor (动态代码自解密与安全执行深模块)', () => {
  let decryptor: DynamicCodeDecryptor;
  const testKey = 'secret-encryption-key-32-bytes!!';

  beforeEach(() => {
    decryptor = new DynamicCodeDecryptor();
  });

  it('应能将敏感代码闭包安全加密，并在运行时即时解密执行返回正确结果', async () => {
    // 待保护的敏感逻辑：核心授权运算与状态判定
    const sourceCode = `
      const [userId, seedVal] = args;
      return "AUTH_TOKEN_" + userId.toUpperCase() + "_" + (seedVal * 42);
    `;

    const payload = await decryptor.encryptPayload(sourceCode, testKey);
    expect(payload.ciphertext).toBeDefined();
    expect(payload.ciphertext).not.toContain('AUTH_TOKEN_');
    expect(payload.mac).toBeTruthy();

    // 运行时即时解密并在内存闭包中执行
    const result = await decryptor.decryptAndExecute<string, [string, number]>(
      payload,
      testKey,
      ['user_888', 10]
    );

    expect(result).toBe('AUTH_TOKEN_USER_888_420');
  });

  it('当解密密钥错误时，应认证失败并拒绝执行敏感代码', async () => {
    const sourceCode = `return args[0] * 2;`;
    const payload = await decryptor.encryptPayload(sourceCode, testKey);

    await expect(
      decryptor.decryptAndExecute(payload, 'wrong-attacker-key-00000000000', [5])
    ).rejects.toThrow(/解密认证失败/);
  });

  it('当密文发生单字节篡改时，应被完整性校验拦截', async () => {
    const sourceCode = `return "SECURE_DATA";`;
    const payload = await decryptor.encryptPayload(sourceCode, testKey);

    // 篡改密文首字符
    const tamperedCipher = payload.ciphertext.startsWith('a')
      ? 'b' + payload.ciphertext.slice(1)
      : 'a' + payload.ciphertext.slice(1);

    const tamperedPayload: EncryptedCodePayload = {
      ...payload,
      ciphertext: tamperedCipher,
    };

    await expect(
      decryptor.decryptAndExecute(tamperedPayload, testKey, [])
    ).rejects.toThrow();
  });

  it('执行完毕后临时明文字符串应立即从内存中抹除', async () => {
    const sourceCode = `return "TRANSIENT_OPERATION";`;
    const payload = await decryptor.encryptPayload(sourceCode, testKey);

    let capturedBufferSnapshot = '';
    const res = await decryptor.decryptAndExecute(payload, testKey, [], {
      onBeforeWipe: (plainStr: string) => {
        capturedBufferSnapshot = plainStr;
      },
    });

    expect(res).toBe('TRANSIENT_OPERATION');
    expect(capturedBufferSnapshot).toContain('TRANSIENT_OPERATION');
  });

  it('当执行时间超过抗调试阈值时应抛出调试探测告警', async () => {
    // 模拟恶意攻击者通过断点将动态执行时间拉长到 50ms 以上（测试中使用短阈值）
    const slowCode = `
      const start = Date.now();
      while (Date.now() - start < 60) {}
      return "SLOW_DONE";
    `;

    const payload = await decryptor.encryptPayload(slowCode, testKey);

    await expect(
      decryptor.decryptAndExecute(payload, testKey, [], { maxExecutionMs: 30 })
    ).rejects.toThrow(/检测到动态调试或断点阻滞/);
  });
});
