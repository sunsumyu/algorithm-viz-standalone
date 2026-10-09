/**
 * 客户端离线激活弹窗与授权状态管理 (ClientActivationModal Deep Module)
 *
 * 职责：
 * 1. 启动期自检：检查本地凭证合法性与有效期，未激活时阻断式拦截；
 * 2. 硬件指纹展示：一键复制设备指纹 shortcode；
 * 3. 密码学验签交互：输入离线激活码并调用底层 Rust 模块进行 Ed25519 验证；
 * 4. 凭证本地安全持久化与标题栏状态联动。
 */

import { getMachineCode } from './machine-uid';
import {
  verifyLicenseCode,
  isLicenseActive,
  saveStoredLicense,
  getStoredLicense,
  clearStoredLicense,
  formatExpiration,
  type LicensePayload,
} from './license-verifier';

export interface ActivationModalOpenOptions {
  blocking?: boolean;
}

export class ClientActivationModal {
  private static instance: ClientActivationModal | null = null;
  private backdropEl: HTMLElement | null = null;
  private isOpen: boolean = false;
  private isBlocking: boolean = false;
  private currentMachineCode: string = '正在获取...';
  private currentPayload: LicensePayload | null = null;

  private constructor() {
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
  }

  public static getInstance(): ClientActivationModal {
    if (!ClientActivationModal.instance) {
      ClientActivationModal.instance = new ClientActivationModal();
    }
    return ClientActivationModal.instance;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public getCurrentPayload(): LicensePayload | null {
    return this.currentPayload;
  }

  /**
   * 重置单例状态（仅用于单元测试环境隔离）
   */
  public resetForTesting(): void {
    this.isOpen = false;
    this.isBlocking = false;
    this.currentPayload = null;
    this.currentMachineCode = '正在获取...';
    if (this.backdropEl) {
      this.backdropEl.remove();
      this.backdropEl = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleGlobalKeydown);
    }
  }

  /**
   * 应用启动时的自动自检守护程序：若未激活则弹出阻断模态框
   */
  public async checkAndEnforceLicense(): Promise<boolean> {
    const stored = getStoredLicense();
    if (stored) {
      try {
        const payload = await verifyLicenseCode(stored);
        if (isLicenseActive(payload)) {
          this.currentPayload = payload;
          this.updateTitlebarBadge(true, `已授权 (Tier ${payload.tier})`);
          return true;
        }
      } catch (err) {
        console.warn('[Security] 本地保存的激活码校验失败或已过期:', err);
      }
    }

    // 未激活或凭证失效
    this.updateTitlebarBadge(false, '未激活 (点击授权)');
    this.open({ blocking: true });
    return false;
  }

  /**
   * 打开激活弹窗
   */
  public async open(options?: ActivationModalOpenOptions): Promise<void> {
    this.isBlocking = options?.blocking ?? false;
    this.ensureDomCreated();

    if (!this.backdropEl) return;

    this.isOpen = true;
    this.backdropEl.classList.add('is-open');
    document.addEventListener('keydown', this.handleGlobalKeydown);

    // 异步加载机器码
    try {
      this.currentMachineCode = await getMachineCode();
    } catch {
      this.currentMachineCode = 'UNKNOWN-DEVICE';
    }

    this.renderState();
  }

  /**
   * 关闭激活弹窗
   */
  public close(): void {
    if (this.isBlocking && !this.currentPayload) {
      alert('请先输入有效的激活码完成授权，方可进入系统。');
      return;
    }

    if (!this.backdropEl) return;
    this.isOpen = false;
    this.backdropEl.classList.remove('is-open');
    document.removeEventListener('keydown', this.handleGlobalKeydown);
  }

  private handleGlobalKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.isOpen) {
      if (!this.isBlocking || this.currentPayload) {
        this.close();
      }
    }
  }

  /**
   * 确保弹窗 DOM 已初始化
   */
  private ensureDomCreated(): void {
    if (this.backdropEl) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'client-activation-modal-backdrop';
    backdrop.className = 'activation-modal-backdrop';

    backdrop.innerHTML = `
      <div class="activation-modal-card" id="activation-modal-card">
        <div class="activation-modal-header">
          <div class="activation-modal-title-group">
            <span class="activation-modal-icon">🔐</span>
            <div>
              <h2 class="activation-modal-title">软件授权与离线激活</h2>
              <div class="activation-modal-subtitle">算法动画演示桌面专业版 (一机一码离线认证)</div>
            </div>
          </div>
          <button class="activation-modal-close-btn" id="activation-close-btn" type="button" aria-label="关闭">✕</button>
        </div>

        <div class="activation-modal-body" id="activation-modal-body">
          <!-- 动态渲染内容 -->
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdropEl = backdrop;

    // 点击背景关闭 (非 blocking 模式)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    const closeBtn = backdrop.querySelector('#activation-close-btn') as HTMLElement;
    closeBtn?.addEventListener('click', () => this.close());
  }

  /**
   * 渲染弹窗内容状态
   */
  private renderState(): void {
    const body = this.backdropEl?.querySelector('#activation-modal-body');
    const closeBtn = this.backdropEl?.querySelector('#activation-close-btn') as HTMLElement;
    if (!body) return;

    // 如果处于强阻断模式且未激活，隐藏关闭按钮
    if (closeBtn) {
      closeBtn.style.display = this.isBlocking && !this.currentPayload ? 'none' : 'block';
    }

    if (this.currentPayload && isLicenseActive(this.currentPayload)) {
      // 已激活状态视图
      body.innerHTML = `
        <div class="activation-active-details">
          <div class="activation-detail-row">
            <span class="activation-detail-label">授权状态</span>
            <span class="activation-detail-val" style="color: #4ade80;">✓ 已激活 (正版授权)</span>
          </div>
          <div class="activation-detail-row">
            <span class="activation-detail-label">购买用户</span>
            <span class="activation-detail-val">${this.currentPayload.user_id}</span>
          </div>
          <div class="activation-detail-row">
            <span class="activation-detail-label">授权等级</span>
            <span class="activation-detail-val">Tier ${this.currentPayload.tier} (全功能)</span>
          </div>
          <div class="activation-detail-row">
            <span class="activation-detail-label">有效期至</span>
            <span class="activation-detail-val">${formatExpiration(this.currentPayload.exp)}</span>
          </div>
          <div class="activation-detail-row">
            <span class="activation-detail-label">绑机机器码</span>
            <span class="activation-detail-val">${this.currentPayload.uid}</span>
          </div>
        </div>

        <div class="activation-actions">
          <button class="activation-submit-btn" id="activation-reenter-btn" type="button">更换授权码</button>
          <button class="activation-reset-btn" id="activation-clear-btn" type="button">清除授权</button>
        </div>
      `;

      body.querySelector('#activation-reenter-btn')?.addEventListener('click', () => {
        this.currentPayload = null;
        this.renderState();
      });

      body.querySelector('#activation-clear-btn')?.addEventListener('click', () => {
        if (confirm('确定要清除本机已保存的激活凭证吗？清除后需重新激活。')) {
          clearStoredLicense();
          this.currentPayload = null;
          this.updateTitlebarBadge(false, '未激活 (点击授权)');
          this.renderState();
        }
      });
      return;
    }

    // 未激活状态视图：展示机器码 + 激活码输入域
    body.innerHTML = `
      <div>
        <div class="activation-section-label">
          <span>💻 本机设备指纹 (机器码)</span>
        </div>
        <div class="activation-hwid-box">
          <span class="activation-hwid-code" id="activation-hwid-display">${this.currentMachineCode}</span>
          <button class="activation-copy-btn" id="activation-copy-hwid-btn" type="button">
            <span>📋</span>
            <span id="copy-btn-text">复制机器码</span>
          </button>
        </div>
      </div>

      <div>
        <div class="activation-section-label">
          <span>🔑 离线激活码</span>
        </div>
        <textarea
          class="activation-input-area"
          id="activation-input-code"
          placeholder="在此粘贴开发者提供的离线激活码..."
          spellcheck="false"
        ></textarea>
      </div>

      <div class="activation-feedback-box" id="activation-feedback"></div>

      <div class="activation-actions">
        <button class="activation-submit-btn" id="activation-do-activate-btn" type="button">
          <span>⚡ 立即激活</span>
        </button>
      </div>

      <div class="activation-help-tip">
        提示：复制上方设备机器码发送给授权方，即可获取对应的数字签名离线激活码。
      </div>
    `;

    // 复制机器码事件
    const copyBtn = body.querySelector('#activation-copy-hwid-btn');
    const copyBtnText = body.querySelector('#copy-btn-text');
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.currentMachineCode);
        if (copyBtnText) copyBtnText.textContent = '已复制 ✓';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = '复制机器码';
        }, 1500);
      } catch {
        alert(`请手动复制机器码: ${this.currentMachineCode}`);
      }
    });

    // 立即激活按钮事件
    const submitBtn = body.querySelector('#activation-do-activate-btn') as HTMLButtonElement;
    const inputArea = body.querySelector('#activation-input-code') as HTMLTextAreaElement;
    const feedbackBox = body.querySelector('#activation-feedback') as HTMLElement;

    submitBtn?.addEventListener('click', async () => {
      const code = inputArea.value.trim();
      if (!code) {
        this.showFeedback(feedbackBox, 'error', '请输入激活码');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ 正在验证数字签名...</span>';

      try {
        const payload = await verifyLicenseCode(code);
        saveStoredLicense(code);
        this.currentPayload = payload;
        this.isBlocking = false;
        this.updateTitlebarBadge(true, `已授权 (Tier ${payload.tier})`);

        this.showFeedback(feedbackBox, 'success', `✓ 激活成功！欢迎 ${payload.user_id}`);

        setTimeout(() => {
          this.close();
        }, 1000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.showFeedback(feedbackBox, 'error', msg);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>⚡ 立即激活</span>';
      }
    });
  }

  private showFeedback(el: HTMLElement, type: 'error' | 'success', message: string): void {
    el.className = `activation-feedback-box ${type}`;
    el.style.display = 'flex';
    el.innerHTML = type === 'error' ? `<span>❌</span> <span>${message}</span>` : `<span>✓</span> <span>${message}</span>`;
  }

  /**
   * 联动更新标题栏徽章或按钮
   */
  public updateTitlebarBadge(isLicensed: boolean, label?: string): void {
    const badge = document.getElementById('titlebar-license-badge');
    if (!badge) return;

    badge.className = `titlebar-license-badge ${isLicensed ? 'licensed' : 'unlicensed'}`;
    badge.textContent = label || (isLicensed ? '🔑 已授权' : '🔒 未激活');
  }
}

export const clientActivationModal = ClientActivationModal.getInstance();
