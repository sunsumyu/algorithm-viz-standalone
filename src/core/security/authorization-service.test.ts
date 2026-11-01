// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveAuthorization,
  requireAlgorithmAccess,
  applyAuthorizationSideEffects,
} from './authorization-service';
import { registerAccount, clearStoredSession } from './account-service';
import { LICENSE_STORAGE_KEY } from './license-verifier';
import { usageTracker } from './usage-tracker';
import { accountModal } from './account-modal';
import { clientActivationModal } from './client-activation-modal';

function setPaygoEntitlement(credits: number, trialEndsAt = 0): void {
  const raw = localStorage.getItem('alg_viz_account_store_fallback_v1')!;
  const body = JSON.parse(raw);
  body.accounts['13800138000'].entitlement.trial_ends_at = trialEndsAt;
  body.accounts['13800138000'].entitlement.mode = 'paygo';
  body.accounts['13800138000'].entitlement.credits = credits;
  localStorage.setItem('alg_viz_account_store_fallback_v1', JSON.stringify(body));
}

describe('AuthorizationService (统一授权门禁)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearStoredSession();
    usageTracker.clear();
    accountModal.resetForTesting();
    clientActivationModal.resetForTesting();
    document.body.innerHTML = `
      <header>
        <button id="titlebar-license-badge" class="titlebar-license-badge unlicensed">🔒 未激活</button>
        <span id="titlebar-account-text">未登录</span>
      </header>
    `;
    vi.restoreAllMocks();
  });

  it('无任何授权上下文时解析为未授权', async () => {
    const state = await resolveAuthorization();
    expect(state.authorized).toBe(false);
    expect(state.source).toBe('none');
    expect(state.mode).toBe('none');
  });

  it('账号试用期内应解析为 account 授权源', async () => {
    await registerAccount('13800138000', 'secret1');
    const state = await resolveAuthorization();
    expect(state.authorized).toBe(true);
    expect(state.source).toBe('account');
    expect(state.mode).toBe('trial');
    expect(state.identity).toBe('138****8000');
    expect(state.detail).toContain('试用期');
  });

  it('本地保存的有效激活码应解析为 machine-license 授权源', async () => {
    // 构造合法结构（浏览器降级 mock 验签：b64(payload).b64(sig)）
    const payload = { v: 1, uid: 'E804-62DB-86BA-555E', exp: 0, user_id: 'VIP-USER-8899', tier: 3 };
    const fakeSig = 'A'.repeat(86);
    localStorage.setItem(LICENSE_STORAGE_KEY, `${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')}.${fakeSig}`);

    const state = await resolveAuthorization();
    expect(state.authorized).toBe(true);
    expect(state.source).toBe('machine-license');
    expect(state.mode).toBe('tier-license');
    expect(state.identity).toBe('VIP-USER-8899');
  });

  it('账号权益失效且无激活码时，requireAlgorithmAccess 阻断并打开账号弹窗', async () => {
    await registerAccount('13800138000', 'secret1');
    setPaygoEntitlement(0); // 试用过期 + 无余量

    const openSpy = vi.spyOn(accountModal, 'open').mockResolvedValue(undefined);
    const allowed = await requireAlgorithmAccess('two-sum');
    expect(allowed).toBe(false);
    expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ blocking: true }));
    expect(usageTracker.getEvents().some((e) => e.type === 'ACCESS_DENIED')).toBe(true);
  });

  it('按量付费权益充足时放行并自动扣次', async () => {
    await registerAccount('13800138000', 'secret1');
    setPaygoEntitlement(5);

    const allowed = await requireAlgorithmAccess('two-sum');
    expect(allowed).toBe(true);

    const raw = localStorage.getItem('alg_viz_account_store_fallback_v1')!;
    const body = JSON.parse(raw);
    expect(body.accounts['13800138000'].entitlement.credits).toBe(4);
    // 扣次事件由 consumeOneUse 统一追踪，算法打开事件单独承载 algorithmId
    const consumed = usageTracker.getEvents().filter((e) => e.type === 'CREDIT_CONSUMED');
    expect(consumed).toHaveLength(1);
    expect(consumed[0].detail).toEqual({ creditsRemaining: 4 });
  });

  it('试用期内免扣次直接放行', async () => {
    await registerAccount('13800138000', 'secret1');

    const allowed = await requireAlgorithmAccess('binary-search');
    expect(allowed).toBe(true);
    expect(usageTracker.getEvents().some((e) => e.type === 'CREDIT_CONSUMED')).toBe(false);
  });

  it('无会话且无激活码上下文时放行（裁决权交由启动期门禁）', async () => {
    const allowed = await requireAlgorithmAccess('two-sum');
    expect(allowed).toBe(true);
  });

  it('存在激活码凭证但已失效时，会话中复核阻断并打开激活弹窗', async () => {
    localStorage.setItem(LICENSE_STORAGE_KEY, 'this-is-not-a-valid-license');

    const openSpy = vi.spyOn(clientActivationModal, 'open').mockResolvedValue(undefined);
    const allowed = await requireAlgorithmAccess('two-sum');
    expect(allowed).toBe(false);
    expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ blocking: true }));
  });

  it('applyAuthorizationSideEffects 联动标题栏徽章与账号文本', async () => {
    await registerAccount('13800138000', 'secret1');
    const state = await resolveAuthorization();
    applyAuthorizationSideEffects(state);

    const badge = document.getElementById('titlebar-license-badge')!;
    expect(badge.className).toContain('licensed');
    expect(badge.textContent).toBe('👤 138****8000');
    expect(document.getElementById('titlebar-account-text')!.textContent).toBe('138****8000');
  });
});
