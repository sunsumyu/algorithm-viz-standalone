/**
 * 统一授权门禁服务 (Authorization Service Deep Module)
 *
 * 职责：
 * 1. 双通道授权归一：账号权益（试用 / 按量 / 永久会员）与离线机器码激活码
 *    两套授权来源在此汇合为单一 AuthorizationState 事实来源；
 * 2. 启动期阻断式自检：无任何有效授权时弹窗拦截，账号登录与离线激活双入口；
 * 3. 按量付费扣次接缝：算法打开前经 `requireAlgorithmAccess` 统一裁决，
 *    按量模式自动扣次，余量不足时阻断并引导充值；
 * 4. 联动标题栏徽章、可见水印身份与行为追踪器，授权状态变化全链路同步。
 */

import {
  fetchEntitlement,
  consumeOneUse,
  getStoredSession,
  type EntitlementStatusView,
} from './account-service';
import {
  getStoredLicense,
  verifyLicenseCode,
  isLicenseActive,
  formatExpiration,
} from './license-verifier';
import { usageTracker } from './usage-tracker';
import { visibleWatermark } from './visible-watermark';

export type AuthorizationSource = 'account' | 'machine-license' | 'none';

export interface AuthorizationState {
  authorized: boolean;
  source: AuthorizationSource;
  /** trial 试用 | paygo 按量 | lifetime 永久会员 | tier-license 激活码授权 | none */
  mode: string;
  /** 展示用身份（手机号掩码或激活码 user_id） */
  identity: string;
  /** 人类可读授权详情（标题栏与水印使用） */
  detail: string;
  trialRemainingSecs?: number;
  creditsRemaining?: number;
  /** 到期 Unix 秒 (0 = 永久) */
  expiresAt?: number;
}

const AUTHORIZED_STATE_CACHE_KEY = 'alg_viz_authorization_cache_v1';

function accountDetail(status: EntitlementStatusView): string {
  if (status.mode === 'lifetime') return '永久会员';
  if (status.mode === 'trial' && status.trial_active) {
    return `试用期剩余 ${Math.max(1, Math.ceil(status.trial_remaining_secs / 86400))} 天`;
  }
  if (status.credits > 0) return `按量付费 · 剩余 ${status.credits} 次`;
  return '权益已失效';
}

/**
 * 汇合双通道授权：账号权益优先，机器码激活码兜底
 */
export async function resolveAuthorization(): Promise<AuthorizationState> {
  // 1. 账号权益通道
  const status = await fetchEntitlement();
  if (status && status.active) {
    return {
      authorized: true,
      source: 'account',
      mode: status.mode,
      identity: status.phone,
      detail: accountDetail(status),
      trialRemainingSecs: status.trial_remaining_secs,
      creditsRemaining: status.credits,
      expiresAt: status.mode === 'trial' ? status.trial_ends_at : 0,
    };
  }

  // 2. 离线机器码激活码通道
  const stored = getStoredLicense();
  if (stored) {
    try {
      const payload = await verifyLicenseCode(stored);
      if (isLicenseActive(payload)) {
        return {
          authorized: true,
          source: 'machine-license',
          mode: 'tier-license',
          identity: payload.user_id,
          detail: `Tier ${payload.tier} · ${formatExpiration(payload.exp)}`,
          expiresAt: payload.exp,
        };
      }
    } catch {
      // 本地凭证失效，落入未授权
    }
  }

  return {
    authorized: false,
    source: 'none',
    mode: 'none',
    identity: getStoredSession()?.phone ? '未授权账号' : '匿名',
    detail: '未激活',
  };
}

/**
 * 联动刷新标题栏徽章 / 水印身份 / 追踪器身份，并缓存最新状态
 */
export function applyAuthorizationSideEffects(state: AuthorizationState): void {
  const badge = document.getElementById('titlebar-license-badge');
  if (badge) {
    if (state.authorized) {
      badge.className = 'titlebar-license-badge licensed';
      badge.textContent = state.source === 'account' ? `👤 ${state.identity}` : '🔑 已授权';
    } else {
      badge.className = 'titlebar-license-badge unlicensed';
      badge.textContent = '🔒 未激活';
    }
  }

  const accountText = document.getElementById('titlebar-account-text');
  if (accountText) {
    accountText.textContent = state.source === 'account' ? state.identity : '未登录';
  }

  usageTracker.setIdentity(state.authorized ? state.identity : 'anonymous');
  visibleWatermark.setIdentityText(state.authorized ? `${state.identity} · ${state.detail}` : '');

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(AUTHORIZED_STATE_CACHE_KEY, JSON.stringify(state));
  }
}

export function getCachedAuthorization(): AuthorizationState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTHORIZED_STATE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthorizationState) : null;
  } catch {
    return null;
  }
}

/**
 * 启动期阻断式自检：账号授权 → 激活码授权 → 均无则弹窗拦截
 * （拦截弹窗内提供「账号登录注册」与「离线激活码」双入口）
 */
export async function checkAndEnforceAuthorization(): Promise<AuthorizationState> {
  const state = await resolveAuthorization();
  applyAuthorizationSideEffects(state);

  if (state.authorized) {
    return state;
  }

  const { clientActivationModal } = await import('./client-activation-modal');
  clientActivationModal.updateTitlebarBadge(false, '未激活 (点击授权)');
  clientActivationModal.open({ blocking: true });
  usageTracker.track('ACCESS_DENIED', { detail: { reason: 'startup-no-authorization' } });
  return state;
}

/**
 * 算法打开前的统一授权裁决与按量扣次
 *
 * 裁决语义：
 * - 有账号会话：按权益状态裁决（按量模式自动扣次，余量不足阻断）；
 * - 无会话但有激活码凭证：会话中复核有效期，失效即阻断（启动期已拦截过，
 *   此处兜底「运行中过期」场景）；
 * - 无任何授权上下文：交由启动期 `checkAndEnforceAuthorization` 统一裁决
 *   （桌面端启动门禁必然先于本函数执行；纯测试/未引导宿主保持可通行）。
 *
 * @returns 是否放行
 */
export async function requireAlgorithmAccess(algorithmId: string): Promise<boolean> {
  const session = getStoredSession();

  // 1. 账号权益通道
  if (session) {
    const status = await fetchEntitlement();
    if (status?.active) {
      // 按量付费模式：每次打开算法扣减一次余量（扣次事件由 consumeOneUse 统一追踪）
      if (status.mode === 'paygo') {
        try {
          const after = await consumeOneUse();
          if (after.credits <= 0) {
            console.warn('[Authorization] 按量余量已用尽，本次放行后请及时充值');
          }
        } catch (err) {
          usageTracker.track('ACCESS_DENIED', {
            algorithmId,
            detail: { reason: err instanceof Error ? err.message : String(err) },
          });
          const { accountModal } = await import('./account-modal');
          accountModal.open({ blocking: true, notice: err instanceof Error ? err.message : String(err) });
          return false;
        }
      }
      return true;
    }

    // 会话存在但权益失效（试用到期 / 会话过期 / 余量耗尽）
    usageTracker.track('ACCESS_DENIED', { algorithmId, detail: { reason: 'account-entitlement-inactive' } });
    const { accountModal } = await import('./account-modal');
    accountModal.open({ blocking: true, notice: '账号权益已失效，请兑换凭证续期或重新登录' });
    return false;
  }

  // 2. 离线激活码通道（仅存在凭证历史时做会话中复核）
  const stored = getStoredLicense();
  if (stored) {
    try {
      const payload = await verifyLicenseCode(stored);
      if (isLicenseActive(payload)) {
        return true;
      }
    } catch {
      // 凭证损坏，视为失效
    }
    usageTracker.track('ACCESS_DENIED', { algorithmId, detail: { reason: 'license-expired-mid-session' } });
    const { clientActivationModal } = await import('./client-activation-modal');
    clientActivationModal.open({ blocking: true });
    return false;
  }

  // 3. 无任何授权上下文：启动期门禁负责裁决，此处放行
  return true;
}
