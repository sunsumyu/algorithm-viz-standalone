// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerAccount,
  loginAccount,
  logoutAccount,
  fetchEntitlement,
  consumeOneUse,
  redeemVoucherCode,
  isValidPhone,
  maskPhone,
  formatTrialRemaining,
  DEFAULT_TRIAL_DAYS,
  getStoredSession,
  clearStoredSession,
} from './account-service';
import { usageTracker } from './usage-tracker';

describe('AccountService (账号注册登录服务 · Web 降级实现)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearStoredSession();
    usageTracker.clear();
  });

  it('手机号格式校验与掩码', () => {
    expect(isValidPhone('13800138000')).toBe(true);
    expect(isValidPhone('23800138000')).toBe(false);
    expect(isValidPhone('1380013800')).toBe(false);
    expect(isValidPhone('1380013800a')).toBe(false);
    expect(maskPhone('13800138000')).toBe('138****8000');
  });

  it('注册应当自动授予试用期并建立会话', async () => {
    const view = await registerAccount('13800138000', 'secret1', '张三');
    expect(view.token).toBeTruthy();
    expect(view.status.phone).toBe('138****8000');
    expect(view.status.mode).toBe('trial');
    expect(view.status.active).toBe(true);
    expect(view.status.trial_active).toBe(true);
    // 默认试用 7 天（允许秒级误差）
    expect(view.status.trial_remaining_secs).toBeGreaterThan(DEFAULT_TRIAL_DAYS * 86400 - 60);
    expect(view.status.trial_remaining_secs).toBeLessThanOrEqual(DEFAULT_TRIAL_DAYS * 86400);

    // 会话已本地持久化
    expect(getStoredSession()?.phone).toBe('13800138000');
  });

  it('注册校验：非法手机号 / 短密码 / 重复注册均拒绝', async () => {
    await expect(registerAccount('13800', 'secret1')).rejects.toThrow('手机号格式不正确');
    await expect(registerAccount('13800138000', '12345')).rejects.toThrow('密码长度需至少 6 位');

    await registerAccount('13800138000', 'secret1');
    await expect(registerAccount('13800138000', 'secret2')).rejects.toThrow('该手机号已注册');
  });

  it('登录：正确密码通过，错误密码拒绝', async () => {
    await registerAccount('13800138000', 'secret1');

    const view = await loginAccount('13800138000', 'secret1');
    expect(view.status.phone).toBe('138****8000');

    await expect(loginAccount('13800138000', 'wrong!')).rejects.toThrow('手机号或密码错误');
    await expect(loginAccount('13900139000', 'secret1')).rejects.toThrow('手机号或密码错误');
  });

  it('注销后权益查询返回 null', async () => {
    await registerAccount('13800138000', 'secret1');
    expect(await fetchEntitlement()).not.toBeNull();

    await logoutAccount();
    expect(await fetchEntitlement()).toBeNull();
    expect(getStoredSession()).toBeNull();
  });

  it('试用期内消费不扣次数，试用过期后无余量消费被拒', async () => {
    const view = await registerAccount('13800138000', 'secret1');
    const status = await consumeOneUse();
    expect(status.credits).toBe(0);
    expect(status.active).toBe(true);

    // 手动将账号推进到「试用过期 + 无余量」状态
    const raw = localStorage.getItem('alg_viz_account_store_fallback_v1')!;
    const body = JSON.parse(raw);
    body.accounts['13800138000'].entitlement.trial_ends_at = Math.floor(Date.now() / 1000) - 100;
    body.accounts['13800138000'].entitlement.credits = 0;
    body.accounts['13800138000'].entitlement.mode = 'paygo';
    localStorage.setItem('alg_viz_account_store_fallback_v1', JSON.stringify(body));

    await expect(consumeOneUse()).rejects.toThrow('按量付费次数已用尽');
    expect(view.status.mode).toBe('trial');
  });

  it('按量付费模式消费应逐次递减余额', async () => {
    await registerAccount('13800138000', 'secret1');

    // 直接构造 paygo 权益：5 次余量、试用已过期
    const raw = localStorage.getItem('alg_viz_account_store_fallback_v1')!;
    const body = JSON.parse(raw);
    body.accounts['13800138000'].entitlement.trial_ends_at = 0;
    body.accounts['13800138000'].entitlement.mode = 'paygo';
    body.accounts['13800138000'].entitlement.credits = 5;
    localStorage.setItem('alg_viz_account_store_fallback_v1', JSON.stringify(body));

    expect((await consumeOneUse()).credits).toBe(4);
    expect((await consumeOneUse()).credits).toBe(3);
    expect((await consumeOneUse()).credits).toBe(2);

    // 扣次行为应被追踪
    const tracked = usageTracker.getEvents().filter((e) => e.type === 'CREDIT_CONSUMED');
    expect(tracked).toHaveLength(3);
  });

  it('权益凭证兑换：格式错误与未登录均被拒（真实验签由桌面端 Ed25519 承担）', async () => {
    await registerAccount('13800138000', 'secret1');

    await expect(redeemVoucherCode('not-a-voucher')).rejects.toThrow('权益凭证格式错误');
    await expect(redeemVoucherCode('')).rejects.toThrow('请输入权益凭证字符串');

    clearStoredSession();
    await expect(redeemVoucherCode('abc.def')).rejects.toThrow('请先登录账号');
  });

  it('试用剩余时间格式化', () => {
    expect(formatTrialRemaining(0)).toBe('已到期');
    expect(formatTrialRemaining(-10)).toBe('已到期');
    expect(formatTrialRemaining(3 * 86400 + 2 * 3600)).toContain('3 天');
    expect(formatTrialRemaining(2 * 3600)).toContain('2 小时');
  });
});
