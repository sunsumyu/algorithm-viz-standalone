import { describe, it, expect } from 'vitest';
import { obfuscateString, deobfuscateString, secureString } from './string-obfuscator';

describe('String Obfuscator Security Module', () => {
  it('应成功对中英文敏感文本进行 RC4 混淆并在解密时 100% 还原', () => {
    const original = 'Tauri-IPC-fetch_algorithm_chunk:secret_key_12345';
    const cipherHex = obfuscateString(original);

    // 断言密文为十六进制且与明文完全不一致
    expect(cipherHex).not.toBe(original);
    expect(/^[0-9a-f]+$/i.test(cipherHex)).toBe(true);

    const decrypted = deobfuscateString(cipherHex);
    expect(decrypted).toBe(original);
  });

  it('应支持自定义密钥加解密，密钥不匹配时无法还原明文', () => {
    const original = '算法授权验证通过：专业版永久授权';
    const key = 'custom-user-secret-salt-888';
    const wrongKey = 'wrong-attacker-salt-000';

    const cipherHex = obfuscateString(original, key);
    const decryptedCorrect = deobfuscateString(cipherHex, key);
    const decryptedWrong = deobfuscateString(cipherHex, wrongKey);

    expect(decryptedCorrect).toBe(original);
    expect(decryptedWrong).not.toBe(original);
  });

  it('使用 secureString 便捷访问器能正确即时求值', () => {
    const sensitive = 'LICENSE_EXPIRED_OR_REVOKED';
    const cipherHex = obfuscateString(sensitive);

    expect(secureString(cipherHex)).toBe(sensitive);
  });

  it('对异常或空密文输入具有防御性，不崩溃并返回空字符串', () => {
    expect(deobfuscateString('')).toBe('');
    expect(deobfuscateString('invalid_odd_hex')).toBe('');
  });
});
