/**
 * 账号登录注册与权益中心弹窗 (Account Modal Deep Module)
 *
 * 职责：
 * 1. 手机号 + 密码注册 / 登录双选项卡交互，自动恢复会话登录态；
 * 2. 权益看板：试用剩余天数、按量付费余量、永久会员状态的实时可视化；
 * 3. 权益凭证兑换：粘贴开发者签发的 Ed25519 凭证字符串一键延长试用 / 充值；
 * 4. 与离线激活码弹窗互链，未登录用户可切换至一机一码离线激活通道。
 */

import {
  loginAccount,
  registerAccount,
  logoutAccount,
  fetchEntitlement,
  redeemVoucherCode,
  formatTrialRemaining,
  type EntitlementStatusView,
} from './account-service';
import { usageTracker } from './usage-tracker';

export interface AccountModalOpenOptions {
  blocking?: boolean;
  /** 打开时展示的提示信息（如按量余量用尽引导充值） */
  notice?: string;
}

type AccountTabId = 'login' | 'register';

export class AccountModal {
  private static instance: AccountModal | null = null;
  private backdropEl: HTMLElement | null = null;
  private isOpen = false;
  private isBlocking = false;
  private activeNotice = '';
  private currentTab: AccountTabId = 'login';
  private currentStatus: EntitlementStatusView | null = null;

  private constructor() {
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
  }

  public static getInstance(): AccountModal {
    if (!AccountModal.instance) {
      AccountModal.instance = new AccountModal();
    }
    return AccountModal.instance;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public getCurrentStatus(): EntitlementStatusView | null {
    return this.currentStatus;
  }

  public resetForTesting(): void {
    this.isOpen = false;
    this.isBlocking = false;
    this.currentTab = 'login';
    this.currentStatus = null;
    this.activeNotice = '';
    if (this.backdropEl) {
      this.backdropEl.remove();
      this.backdropEl = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleGlobalKeydown);
    }
  }

  /**
   * 打开弹窗；有本地会话时先尝试恢复登录态
   */
  public async open(options?: AccountModalOpenOptions): Promise<void> {
    this.isBlocking = options?.blocking ?? false;
    this.activeNotice = options?.notice ?? '';
    this.ensureDomCreated();
    if (!this.backdropEl) return;

    this.isOpen = true;
    this.backdropEl.classList.add('is-open');
    document.addEventListener('keydown', this.handleGlobalKeydown);

    try {
      this.currentStatus = await fetchEntitlement();
    } catch {
      this.currentStatus = null;
    }
    this.renderState();
  }

  public close(): void {
    if (this.isBlocking && !this.currentStatus?.active) {
      alert('请先登录账号或完成离线激活，方可进入系统；或切换至「离线激活」通道。');
      return;
    }
    if (!this.backdropEl) return;
    this.isOpen = false;
    this.backdropEl.classList.remove('is-open');
    document.removeEventListener('keydown', this.handleGlobalKeydown);
  }

  private handleGlobalKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  private ensureDomCreated(): void {
    if (this.backdropEl) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'account-modal-backdrop';
    backdrop.className = 'account-modal-backdrop';

    backdrop.innerHTML = `
      <div class="account-modal-card">
        <div class="account-modal-header">
          <div class="account-modal-title-group">
            <span class="account-modal-icon">👤</span>
            <div>
              <h2 class="account-modal-title">账号登录与权益中心</h2>
              <div class="account-modal-subtitle">手机号注册 · 试用期 · 按量付费 · 永久会员</div>
            </div>
          </div>
          <button class="account-modal-close-btn" id="account-close-btn" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="account-modal-body" id="account-modal-body"></div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdropEl = backdrop;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });
    backdrop.querySelector('#account-close-btn')?.addEventListener('click', () => this.close());
  }

  /**
   * 依据登录态渲染：已登录 → 权益看板；未登录 → 登录/注册选项卡
   */
  private renderState(): void {
    const body = this.backdropEl?.querySelector('#account-modal-body');
    if (!body) return;

    if (this.currentStatus) {
      this.renderDashboard(body as HTMLElement);
    } else {
      this.renderAuthForm(body as HTMLElement);
    }
  }

  private renderNotice(container: HTMLElement): void {
    if (!this.activeNotice) return;
    const notice = document.createElement('div');
    notice.className = 'account-notice-box';
    notice.textContent = this.activeNotice;
    container.prepend(notice);
    this.activeNotice = '';
  }

  // --------------------------------------------------------
  // 登录 / 注册表单
  // --------------------------------------------------------

  private renderAuthForm(body: HTMLElement): void {
    body.innerHTML = `
      <div class="account-tabs">
        <button class="account-tab ${this.currentTab === 'login' ? 'is-active' : ''}" id="account-tab-login" type="button">登录</button>
        <button class="account-tab ${this.currentTab === 'register' ? 'is-active' : ''}" id="account-tab-register" type="button">注册</button>
      </div>

      <div class="account-field">
        <label class="account-label" for="account-input-phone">📱 手机号</label>
        <input class="account-input" id="account-input-phone" type="tel" maxlength="11"
               placeholder="请输入 11 位手机号" autocomplete="username" />
      </div>

      <div class="account-field">
        <label class="account-label" for="account-input-password">🔑 密码</label>
        <input class="account-input" id="account-input-password" type="password"
               placeholder="${this.currentTab === 'register' ? '设置密码（至少 6 位）' : '请输入密码'}"
               autocomplete="${this.currentTab === 'register' ? 'new-password' : 'current-password'}" />
      </div>

      ${this.currentTab === 'register' ? `
      <div class="account-field">
        <label class="account-label" for="account-input-confirm">🔑 确认密码</label>
        <input class="account-input" id="account-input-confirm" type="password"
               placeholder="请再次输入密码" autocomplete="new-password" />
      </div>
      <div class="account-field">
        <label class="account-label" for="account-input-nickname">✏️ 昵称 (可选)</label>
        <input class="account-input" id="account-input-nickname" type="text" placeholder="用于个性化展示" />
      </div>` : ''}

      <div class="account-feedback-box" id="account-feedback"></div>

      <div class="account-actions">
        <button class="account-submit-btn" id="account-submit-btn" type="button">
          <span>${this.currentTab === 'register' ? '🎉 注册并领取试用' : '→ 登 录'}</span>
        </button>
      </div>

      <div class="account-help-tip">
        ${this.currentTab === 'register'
          ? '注册即自动获得试用期；到期后可兑换权益凭证延长试用或充值按量次数。'
          : '还没有账号？点击上方「注册」选项卡，手机号即可快速注册并领取试用。'}
      </div>

      <div class="account-alt-link" id="account-goto-activation">🔐 使用离线激活码激活 (一机一码) →</div>
    `;

    this.renderNotice(body);

    body.querySelector('#account-tab-login')?.addEventListener('click', () => {
      this.currentTab = 'login';
      this.renderState();
    });
    body.querySelector('#account-tab-register')?.addEventListener('click', () => {
      this.currentTab = 'register';
      this.renderState();
    });

    body.querySelector('#account-goto-activation')?.addEventListener('click', async () => {
      const { clientActivationModal } = await import('./client-activation-modal');
      this.close();
      clientActivationModal.open({ blocking: this.isBlocking });
    });

    const submitBtn = body.querySelector('#account-submit-btn') as HTMLButtonElement | null;
    submitBtn?.addEventListener('click', () => void this.handleSubmit(submitBtn));
  }

  private async handleSubmit(submitBtn: HTMLButtonElement): Promise<void> {
    const body = this.backdropEl?.querySelector('#account-modal-body') as HTMLElement | null;
    if (!body) return;

    const phoneInput = body.querySelector('#account-input-phone') as HTMLInputElement | null;
    const passwordInput = body.querySelector('#account-input-password') as HTMLInputElement | null;
    const confirmInput = body.querySelector('#account-input-confirm') as HTMLInputElement | null;
    const nicknameInput = body.querySelector('#account-input-nickname') as HTMLInputElement | null;
    const feedback = body.querySelector('#account-feedback') as HTMLElement | null;

    const phone = phoneInput?.value.trim() ?? '';
    const password = passwordInput?.value ?? '';

    try {
      submitBtn.disabled = true;

      if (this.currentTab === 'register') {
        if (password !== confirmInput?.value) {
          throw new Error('两次输入的密码不一致');
        }
        const view = await registerAccount(phone, password, nicknameInput?.value ?? '');
        this.currentStatus = view.status;
        usageTracker.track('ACCOUNT_REGISTERED', { detail: { identity: view.status.phone } });
        this.showFeedback(feedback, 'success', `✓ 注册成功，已赠送试用期，欢迎 ${view.status.phone}`);
      } else {
        const view = await loginAccount(phone, password);
        this.currentStatus = view.status;
        usageTracker.track('ACCOUNT_LOGGED_IN', { detail: { identity: view.status.phone } });
        this.showFeedback(feedback, 'success', `✓ 登录成功，欢迎回来 ${view.status.phone}`);
      }

      this.syncAuthorizationSideEffects();
      setTimeout(() => this.renderState(), 600);
    } catch (err) {
      this.showFeedback(feedback, 'error', err instanceof Error ? err.message : String(err));
    } finally {
      submitBtn.disabled = false;
    }
  }

  // --------------------------------------------------------
  // 权益看板
  // --------------------------------------------------------

  private renderDashboard(body: HTMLElement): void {
    const status = this.currentStatus!;
    const modeBadge =
      status.mode === 'lifetime'
        ? '<span class="account-mode-badge lifetime">永久会员</span>'
        : status.mode === 'trial'
          ? '<span class="account-mode-badge trial">试用期</span>'
          : '<span class="account-mode-badge paygo">按量付费</span>';

    const trialRow = `
      <div class="account-detail-row">
        <span class="account-detail-label">试用状态</span>
        <span class="account-detail-val">${status.trial_active ? `剩余 ${formatTrialRemaining(status.trial_remaining_secs)}` : '已到期'}</span>
      </div>`;
    const creditsRow = `
      <div class="account-detail-row">
        <span class="account-detail-label">按量余量</span>
        <span class="account-detail-val ${status.credits > 0 ? '' : 'account-val-danger'}">${status.credits} 次</span>
      </div>`;

    body.innerHTML = `
      <div class="account-active-details">
        <div class="account-detail-row">
          <span class="account-detail-label">登录账号</span>
          <span class="account-detail-val">${status.phone}${status.display_name ? ` (${status.display_name})` : ''} ${modeBadge}</span>
        </div>
        ${trialRow}
        ${creditsRow}
        <div class="account-detail-row">
          <span class="account-detail-label">权益状态</span>
          <span class="account-detail-val ${status.active ? 'account-val-ok' : 'account-val-danger'}">${status.active ? '✓ 可正常使用' : '✗ 已失效，请充值或兑换'}</span>
        </div>
      </div>

      <div class="account-redeem-section">
        <div class="account-section-label">🎁 权益凭证兑换 (延长试用 / 充值次数 / 永久会员)</div>
        <textarea class="account-input-area" id="account-input-voucher"
                  placeholder="在此粘贴开发者提供的权益凭证字符串..." spellcheck="false"></textarea>
      </div>

      <div class="account-feedback-box" id="account-feedback"></div>

      <div class="account-actions">
        <button class="account-submit-btn" id="account-redeem-btn" type="button"><span>⚡ 立即兑换</span></button>
        <button class="account-reset-btn" id="account-logout-btn" type="button"><span>退出登录</span></button>
      </div>

      <div class="account-alt-link" id="account-goto-activation">🔐 使用离线激活码激活 (一机一码) →</div>
    `;

    this.renderNotice(body);

    const redeemBtn = body.querySelector('#account-redeem-btn') as HTMLButtonElement | null;
    redeemBtn?.addEventListener('click', async () => {
      const input = body.querySelector('#account-input-voucher') as HTMLTextAreaElement | null;
      const feedback = body.querySelector('#account-feedback') as HTMLElement | null;
      try {
        redeemBtn!.disabled = true;
        const status = await redeemVoucherCode(input?.value ?? '');
        this.currentStatus = status;
        usageTracker.track('VOUCHER_REDEEMED', { detail: { identity: status.phone, mode: status.mode } });
        this.showFeedback(feedback, 'success', '✓ 兑换成功，权益已即时生效');
        this.syncAuthorizationSideEffects();
        setTimeout(() => this.renderState(), 600);
      } catch (err) {
        this.showFeedback(feedback, 'error', err instanceof Error ? err.message : String(err));
      } finally {
        if (redeemBtn) redeemBtn.disabled = false;
      }
    });

    body.querySelector('#account-logout-btn')?.addEventListener('click', async () => {
      if (!confirm('确定要退出当前账号登录吗？')) return;
      await logoutAccount();
      usageTracker.track('ACCOUNT_LOGGED_OUT');
      this.currentStatus = null;
      this.syncAuthorizationSideEffects();
      this.renderState();
    });

    body.querySelector('#account-goto-activation')?.addEventListener('click', async () => {
      const { clientActivationModal } = await import('./client-activation-modal');
      this.close();
      clientActivationModal.open({ blocking: this.isBlocking });
    });
  }

  /**
   * 登录态变化后广播事件，由 main.ts 挂载的授权刷新器统一联动水印/徽章/追踪
   */
  private syncAuthorizationSideEffects(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:state-changed'));
    }
  }

  private showFeedback(el: HTMLElement | null, type: 'error' | 'success', message: string): void {
    if (!el) return;
    el.className = `account-feedback-box ${type}`;
    el.style.display = 'flex';
    el.innerHTML = type === 'error' ? `<span>❌</span> <span>${message}</span>` : `<span>✓</span> <span>${message}</span>`;
  }
}

export const accountModal = AccountModal.getInstance();
