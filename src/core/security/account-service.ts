/**
 * 账号注册登录客户端服务 (Account Service)
 *
 * 职责：
 * 1. 在桌面客户端环境中通过 Tauri IPC 委托 Rust 端账号库执行
 *    注册 / 登录 / 会话管理 / 权益查询 / 按量扣次 / 凭证兑换；
 * 2. 为未来服务端化预留单一事实来源接缝：Rust 端 `account_store.rs`
 *    切换为远程 HTTP 客户端时，本模块与 UI 契约保持不变；
 * 3. 非 Tauri 环境（Web 预览 / 无头单测）提供 localStorage 降级实现，
 *    语义与 Rust 端完全对齐（试用天数 / 按量扣次 / 凭证格式校验）；
 * 4. 会话令牌本地持久化，重启后自动恢复登录态。
 */

import { usageTracker } from './usage-tracker';

export type EntitlementMode = 'trial' | 'paygo' | 'lifetime';

export interface EntitlementStatusView {
  /** 掩码手机号（138****8000） */
  phone: string;
  display_name: string;
  mode: EntitlementMode;
  trial_ends_at: number;
  trial_active: boolean;
  trial_remaining_secs: number;
  credits: number;
  active: boolean;
  /** false = 本地库阶段；未来接入远程计费服务后由服务端盖章 */
  server_synced: boolean;
}

export interface AccountSessionView {
  token: string;
  status: EntitlementStatusView;
}

/** 新注册账号默认试用天数（与 Rust 端 DEFAULT_TRIAL_DAYS 对齐） */
export const DEFAULT_TRIAL_DAYS = 7;
/** 会话有效期（秒）：30 天 */
export const SESSION_TTL_SECS = 30 * 86400;

export const ACCOUNT_SESSION_STORAGE_KEY = 'alg_viz_account_session_v1';
const ACCOUNT_FALLBACK_STORE_KEY = 'alg_viz_account_store_fallback_v1';

/**
 * 校验中国大陆手机号格式
 */
export function isValidPhone(phone: string): boolean {
  return /^1\d{10}$/.test(phone);
}

/**
 * 手机号掩码（供水印与 UI 展示）
 */
export function maskPhone(phone: string): string {
  if (!/^\d{11}$/.test(phone)) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

/**
 * 检测是否处于 Tauri 桌面环境
 */
export function isTauriHost(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ============================================================
// 会话本地持久化
// ============================================================

interface StoredSession {
  token: string;
  phone: string;
  savedAt: number;
}

export function getStoredSession(): StoredSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(view: AccountSessionView, phone: string): void {
  if (typeof localStorage === 'undefined') return;
  const stored: StoredSession = {
    token: view.token,
    phone,
    savedAt: Date.now(),
  };
  localStorage.setItem(ACCOUNT_SESSION_STORAGE_KEY, JSON.stringify(stored));
}

export function clearStoredSession(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(ACCOUNT_SESSION_STORAGE_KEY);
}

// ============================================================
// Tauri IPC 委托
// ============================================================

async function invokeAccountCommand<T>(command: string, args: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  try {
    return await invoke<T>(command, args);
  } catch (err: unknown) {
    throw new Error(typeof err === 'string' ? err : String(err));
  }
}

// ============================================================
// 非 Tauri 降级实现（语义与 Rust 端 account_store.rs 对齐）
// ============================================================

interface FallbackAccount {
  phone: string;
  display_name: string;
  /** 降级实现为演示用途的加盐摘要，真实安全由 Rust 端 PBKDF2 承担 */
  secret: string;
  created_at: number;
  entitlement: {
    mode: EntitlementMode;
    trial_ends_at: number;
    credits: number;
  };
  used_nonces: string[];
}

interface FallbackStoreBody {
  accounts: Record<string, FallbackAccount>;
  sessions: Record<string, { phone: string; expires_at: number }>;
}

function loadFallbackStore(): FallbackStoreBody {
  if (typeof localStorage === 'undefined') return { accounts: {}, sessions: {} };
  try {
    const raw = localStorage.getItem(ACCOUNT_FALLBACK_STORE_KEY);
    if (raw) return JSON.parse(raw) as FallbackStoreBody;
  } catch {
    // 损坏即重置
  }
  return { accounts: {}, sessions: {} };
}

function saveFallbackStore(body: FallbackStoreBody): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ACCOUNT_FALLBACK_STORE_KEY, JSON.stringify(body));
}

function fallbackDigest(phone: string, password: string, createdAt: number): string {
  // 降级实现的口令摘要仅用于 Web 预览语义演示，非安全边界
  let hash = 0x811c9dc5;
  const material = `${phone}:${password}:${createdAt}`;
  for (let i = 0; i < material.length; i++) {
    hash ^= material.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function fallbackNowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function fallbackMakeToken(): string {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

function fallbackStatus(account: FallbackAccount): EntitlementStatusView {
  const now = fallbackNowSec();
  const trialActive = account.entitlement.trial_ends_at > 0 && now <= account.entitlement.trial_ends_at;
  return {
    phone: maskPhone(account.phone),
    display_name: account.display_name,
    mode: account.entitlement.mode,
    trial_ends_at: account.entitlement.trial_ends_at,
    trial_active: trialActive,
    trial_remaining_secs: trialActive ? account.entitlement.trial_ends_at - now : 0,
    credits: account.entitlement.credits,
    active:
      account.entitlement.mode === 'lifetime' ||
      trialActive ||
      account.entitlement.credits > 0,
    server_synced: false,
  };
}

// ============================================================
// 公共 API
// ============================================================

/**
 * 注册新账号（手机号 + 密码），默认授予试用期并自动登录
 */
export async function registerAccount(phone: string, password: string, displayName = ''): Promise<AccountSessionView> {
  const normalizedPhone = phone.trim();
  if (!isValidPhone(normalizedPhone)) {
    throw new Error('手机号格式不正确（需为 11 位数字且以 1 开头）');
  }
  if (password.length < 6) {
    throw new Error('密码长度需至少 6 位');
  }

  if (isTauriHost()) {
    const view = await invokeAccountCommand<AccountSessionView>('account_register', {
      phone: normalizedPhone,
      password,
      displayName,
    });
    saveStoredSession(view, normalizedPhone);
    return view;
  }

  // 降级实现
  const body = loadFallbackStore();
  if (body.accounts[normalizedPhone]) {
    throw new Error('该手机号已注册，请直接登录');
  }
  const now = fallbackNowSec();
  const account: FallbackAccount = {
    phone: normalizedPhone,
    display_name: displayName.trim(),
    secret: fallbackDigest(normalizedPhone, password, now),
    created_at: now,
    entitlement: {
      mode: 'trial',
      trial_ends_at: now + DEFAULT_TRIAL_DAYS * 86400,
      credits: 0,
    },
    used_nonces: [],
  };
  body.accounts[normalizedPhone] = account;
  const token = fallbackMakeToken();
  body.sessions[token] = { phone: normalizedPhone, expires_at: now + SESSION_TTL_SECS };
  saveFallbackStore(body);
  const view: AccountSessionView = { token, status: fallbackStatus(account) };
  saveStoredSession(view, normalizedPhone);
  return view;
}

/**
 * 手机号 + 密码登录
 */
export async function loginAccount(phone: string, password: string): Promise<AccountSessionView> {
  const normalizedPhone = phone.trim();

  if (isTauriHost()) {
    const view = await invokeAccountCommand<AccountSessionView>('account_login', {
      phone: normalizedPhone,
      password,
    });
    saveStoredSession(view, normalizedPhone);
    return view;
  }

  const body = loadFallbackStore();
  const account = body.accounts[normalizedPhone];
  if (!account || account.secret !== fallbackDigest(normalizedPhone, password, account.created_at)) {
    throw new Error('手机号或密码错误');
  }
  const now = fallbackNowSec();
  const token = fallbackMakeToken();
  body.sessions[token] = { phone: normalizedPhone, expires_at: now + SESSION_TTL_SECS };
  saveFallbackStore(body);
  const view: AccountSessionView = { token, status: fallbackStatus(account) };
  saveStoredSession(view, normalizedPhone);
  return view;
}

/**
 * 注销当前会话
 */
export async function logoutAccount(): Promise<boolean> {
  const session = getStoredSession();
  clearStoredSession();
  if (!session) return false;

  if (isTauriHost()) {
    return invokeAccountCommand<boolean>('account_logout', { token: session.token });
  }

  const body = loadFallbackStore();
  const existed = Boolean(body.sessions[session.token]);
  delete body.sessions[session.token];
  saveFallbackStore(body);
  return existed;
}

/**
 * 查询当前登录账号的权益状态；无会话返回 null
 */
export async function fetchEntitlement(): Promise<EntitlementStatusView | null> {
  const session = getStoredSession();
  if (!session) return null;

  if (isTauriHost()) {
    try {
      return await invokeAccountCommand<EntitlementStatusView>('account_get_entitlement', {
        token: session.token,
      });
    } catch {
      clearStoredSession();
      return null;
    }
  }

  const body = loadFallbackStore();
  const record = body.sessions[session.token];
  if (!record || record.expires_at <= fallbackNowSec()) {
    return null;
  }
  const account = body.accounts[record.phone];
  return account ? fallbackStatus(account) : null;
}

/**
 * 消费一次算法使用（试用期内免扣次，按量付费模式扣减余量）
 * 每次成功消费均写入行为追踪日志（供未来按量计费对账）
 * @throws 余量不足或会话失效时抛出错误
 */
export async function consumeOneUse(): Promise<EntitlementStatusView> {
  const session = getStoredSession();
  if (!session) {
    throw new Error('尚未登录账号');
  }

  if (isTauriHost()) {
    const status = await invokeAccountCommand<EntitlementStatusView>('account_consume_credit', {
      token: session.token,
    });
    usageTracker.track('CREDIT_CONSUMED', { detail: { creditsRemaining: status.credits } });
    return status;
  }

  const body = loadFallbackStore();
  const record = body.sessions[session.token];
  const account = record ? body.accounts[record.phone] : undefined;
  if (!record || !account) {
    throw new Error('登录状态无效，请重新登录');
  }
  if (record.expires_at <= fallbackNowSec()) {
    throw new Error('登录会话已过期，请重新登录');
  }
  if (account.entitlement.mode === 'lifetime' || account.entitlement.trial_ends_at > fallbackNowSec()) {
    return fallbackStatus(account);
  }
  if (account.entitlement.credits <= 0) {
    throw new Error('按量付费次数已用尽，请充值后继续使用');
  }
  account.entitlement.credits -= 1;
  if (account.entitlement.mode !== 'paygo') {
    account.entitlement.mode = 'paygo';
  }
  saveFallbackStore(body);
  const status = fallbackStatus(account);
  usageTracker.track('CREDIT_CONSUMED', { detail: { creditsRemaining: status.credits } });
  return status;
}

/**
 * 兑换开发者签发的权益凭证（延长试用 / 充值次数 / 开通永久会员）
 */
export async function redeemVoucherCode(voucherKey: string): Promise<EntitlementStatusView> {
  const trimmed = voucherKey.trim();
  if (!trimmed) {
    throw new Error('请输入权益凭证字符串');
  }
  if (!trimmed.includes('.') || trimmed.split('.').length !== 2) {
    throw new Error('权益凭证格式错误: 缺少签名分隔符');
  }

  const session = getStoredSession();
  if (!session) {
    throw new Error('请先登录账号后再兑换权益凭证');
  }

  if (isTauriHost()) {
    return invokeAccountCommand<EntitlementStatusView>('account_redeem_voucher', {
      token: session.token,
      voucher: trimmed,
    });
  }

  // 降级实现：仅校验凭证结构并模拟拒收（真实验签必须经 Rust 端 Ed25519）
  throw new Error('权益凭证兑换需在桌面客户端中进行（Web 预览不支持 Ed25519 验签）');
}

/**
 * 将剩余秒数格式化为友好中文文案
 */
export function formatTrialRemaining(remainingSecs: number): string {
  if (remainingSecs <= 0) return '已到期';
  const days = Math.floor(remainingSecs / 86400);
  const hours = Math.floor((remainingSecs % 86400) / 3600);
  if (days > 0) return `${days} 天 ${hours} 小时`;
  return `${hours} 小时`;
}
