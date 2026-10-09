// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  verifyLicenseCode,
  isLicenseActive,
  saveStoredLicense,
  getStoredLicense,
  clearStoredLicense,
  formatExpiration,
  LICENSE_STORAGE_KEY,
  type LicensePayload,
} from './license-verifier';

describe('LicenseVerifier Frontend Facade', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('空激活码应当抛出异常', async () => {
    await expect(verifyLicenseCode('')).rejects.toThrow('激活码不能为空');
    await expect(verifyLicenseCode('   ')).rejects.toThrow('激活码不能为空');
  });

  it('缺少签名分隔符应当抛出格式错误', async () => {
    await expect(verifyLicenseCode('invalid_base64_string')).rejects.toThrow(
      '激活码格式错误: 缺少签名分隔符'
    );
  });

  it('在 Web 模拟模式下正确解析合法载荷', async () => {
    const payload: LicensePayload = {
      v: 1,
      uid: 'E804-62DB-86BA-555E',
      exp: 1893456000,
      user_id: 'USER_1001',
      tier: 3,
    };
    const payloadB64 = btoa(JSON.stringify(payload));
    const dummySigB64 = btoa('mock_signature_64_bytes_padding_long_enough_for_b64_test_abc');
    const licenseKey = `${payloadB64}.${dummySigB64}`;

    const res = await verifyLicenseCode(licenseKey);
    expect(res.uid).toBe('E804-62DB-86BA-555E');
    expect(res.user_id).toBe('USER_1001');
    expect(res.tier).toBe(3);
    expect(res.exp).toBe(1893456000);
  });

  it('算号工具生成的激活码能被前端门面无缝解析', async () => {
    const { generateLicenseToken } = await import('../../../scripts/generate-license');
    const result = generateLicenseToken({
      hwid: 'HWID-TEST-1234',
      days: 30,
      user: 'BUYER-007',
      tier: 2,
    });
    const parsed = await verifyLicenseCode(result.licenseKey);
    expect(parsed.uid).toBe('HWID-TEST-1234');
    expect(parsed.user_id).toBe('BUYER-007');
    expect(parsed.tier).toBe(2);
    expect(parsed.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('过期激活码在 Web 模拟模式下应当抛错', async () => {
    const pastPayload: LicensePayload = {
      v: 1,
      uid: 'E804-62DB-86BA-555E',
      exp: 1000000000, // 过去时间
      user_id: 'EXPIRED_USER',
      tier: 1,
    };
    const payloadB64 = btoa(JSON.stringify(pastPayload));
    const licenseKey = `${payloadB64}.dummySig`;

    await expect(verifyLicenseCode(licenseKey)).rejects.toThrow('授权已过期');
  });

  it('isLicenseActive 正确计算生命周期', () => {
    const perpetual: LicensePayload = {
      v: 1,
      uid: 'M1',
      exp: 0,
      user_id: 'U1',
      tier: 1,
    };
    expect(isLicenseActive(perpetual, 9999999999)).toBe(true);

    const timed: LicensePayload = {
      v: 1,
      uid: 'M1',
      exp: 1728000000,
      user_id: 'U1',
      tier: 1,
    };
    expect(isLicenseActive(timed, 1727999999)).toBe(true);
    expect(isLicenseActive(timed, 1728000000)).toBe(true);
    expect(isLicenseActive(timed, 1728000001)).toBe(false);
  });

  it('formatExpiration 正确格式化到期时间文本', () => {
    expect(formatExpiration(0)).toContain('永久授权');
    expect(formatExpiration(1728470000)).toBeDefined();
  });

  it('本地 LocalStorage 存储能够正确保存、读取与清除', () => {
    expect(getStoredLicense()).toBeNull();

    saveStoredLicense('SAMPLE_KEY_ABC.123');
    expect(getStoredLicense()).toBe('SAMPLE_KEY_ABC.123');
    expect(localStorage.getItem(LICENSE_STORAGE_KEY)).toBe('SAMPLE_KEY_ABC.123');

    clearStoredLicense();
    expect(getStoredLicense()).toBeNull();
  });
});
