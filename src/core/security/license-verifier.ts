/**
 * 客户端授权凭证与验签门面 (License Verifier Frontend Facade)
 *
 * 负责与 Tauri Rust 底层安全模块通信以执行 Ed25519 签名验证，
 * 并提供本地授权凭证存储、过期状态计算与权限等级判定。
 */

export interface LicensePayload {
  v: number;
  uid: string;
  exp: number; // Unix epoch seconds, 0 = 永久
  user_id: string;
  tier: number; // 1: 基础, 2: 进阶, 3: 全量
}

export const LICENSE_STORAGE_KEY = 'alg_viz_client_license_v1';

/**
 * 校验指定激活码是否合法有效。
 * 在桌面客户端环境中，通过 IPC 委托给 Rust 端核心 Ed25519 密码学验签器。
 */
export async function verifyLicenseCode(licenseKey: string): Promise<LicensePayload> {
  const trimmed = licenseKey.trim();
  if (!trimmed) {
    throw new Error('激活码不能为空');
  }

  // 检测是否处于 Tauri 环境
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { invoke } = await import('@tauri-apps/api/core');
    try {
      const payload = await invoke<LicensePayload>('verify_license_code', {
        licenseKey: trimmed,
      });
      return payload;
    } catch (err: unknown) {
      throw new Error(String(err));
    }
  }

  // 非 Tauri 环境（测试或 Web 预览环境）的基础语法解析与降级检查
  return mockVerifyInBrowser(trimmed);
}

/**
 * 非 Tauri 环境下的模拟验签解析（仅用于 Web 预览与前端纯单测）
 */
function mockVerifyInBrowser(licenseKey: string): LicensePayload {
  const parts = licenseKey.split('.');
  if (parts.length !== 2) {
    throw new Error('激活码格式错误: 缺少签名分隔符');
  }

  try {
    const payloadJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as LicensePayload;
    if (payload.v !== 1) {
      throw new Error(`不支持的协议版本: ${payload.v}`);
    }
    if (payload.exp > 0 && Math.floor(Date.now() / 1000) > payload.exp) {
      throw new Error(`授权已过期`);
    }
    return payload;
  } catch (e: unknown) {
    throw new Error(`无效的激活码载荷: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * 检查载荷是否处于激活有效期内
 */
export function isLicenseActive(payload: LicensePayload, nowSec: number = Math.floor(Date.now() / 1000)): boolean {
  if (payload.exp === 0) return true;
  return nowSec <= payload.exp;
}

/**
 * 保存授权码到本地安全存储
 */
export function saveStoredLicense(licenseKey: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LICENSE_STORAGE_KEY, licenseKey.trim());
  }
}

/**
 * 获取本地存储的授权码
 */
export function getStoredLicense(): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LICENSE_STORAGE_KEY);
  }
  return null;
}

/**
 * 清除本地存储的授权凭证
 */
export function clearStoredLicense(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }
}

/**
 * 格式化到期时间文本
 */
export function formatExpiration(expSec: number): string {
  if (expSec === 0) return '永久授权 (Lifetime)';
  const date = new Date(expSec * 1000);
  return date.toLocaleString();
}
