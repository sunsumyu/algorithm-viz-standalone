// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClientActivationModal } from './client-activation-modal';
import * as licenseVerifier from './license-verifier';
import * as machineUid from './machine-uid';

describe('ClientActivationModal (Ticket 07)', () => {
  let modal: ClientActivationModal;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="app">
        <header class="app-titlebar">
          <div class="app-titlebar-actions">
            <button id="titlebar-license-badge" class="titlebar-license-badge unlicensed">🔒 未激活</button>
          </div>
        </header>
      </div>
    `;
    vi.restoreAllMocks();
    modal = ClientActivationModal.getInstance();
    modal.resetForTesting();
    vi.spyOn(machineUid, 'getMachineCode').mockResolvedValue('E804-62DB-86BA-555E');
  });

  afterEach(() => {
    modal.resetForTesting();
  });

  it('首次调用 open() 应当正确创建 DOM 并展示机器码', async () => {
    await modal.open();
    expect(modal.getIsOpen()).toBe(true);

    const backdrop = document.getElementById('client-activation-modal-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.classList.contains('is-open')).toBe(true);

    const hwidDisplay = document.getElementById('activation-hwid-display');
    expect(hwidDisplay?.textContent).toBe('E804-62DB-86BA-555E');
  });

  it('点击复制机器码应当调用剪贴板 API 并更新按钮文案', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await modal.open();
    const copyBtn = document.getElementById('activation-copy-hwid-btn');
    expect(copyBtn).not.toBeNull();

    copyBtn?.click();
    await Promise.resolve(); // 等待微任务

    expect(writeTextMock).toHaveBeenCalledWith('E804-62DB-86BA-555E');
    const btnText = document.getElementById('copy-btn-text');
    expect(btnText?.textContent).toBe('已复制 ✓');
  });

  it('输入空激活码点击激活时应当展示错误反馈', async () => {
    await modal.open();
    const submitBtn = document.getElementById('activation-do-activate-btn');
    submitBtn?.click();

    const feedback = document.getElementById('activation-feedback');
    expect(feedback?.textContent).toContain('请输入激活码');
    expect(feedback?.classList.contains('error')).toBe(true);
  });

  it('输入合法激活码应当成功激活并持久化至本地存储', async () => {
    vi.spyOn(licenseVerifier, 'verifyLicenseCode').mockResolvedValue({
      v: 1,
      uid: 'E804-62DB-86BA-555E',
      exp: 1893456000,
      user_id: 'VIP_ALICE',
      tier: 3,
    });

    await modal.open();
    const inputArea = document.getElementById('activation-input-code') as HTMLTextAreaElement;
    inputArea.value = 'MOCK_VALID_LICENSE_KEY.SIG';

    const submitBtn = document.getElementById('activation-do-activate-btn');
    submitBtn?.click();

    // 等待异步激活操作
    await vi.waitFor(() => {
      const feedback = document.getElementById('activation-feedback');
      return feedback?.classList.contains('success');
    });

    const feedback = document.getElementById('activation-feedback');
    expect(feedback?.textContent).toContain('激活成功！欢迎 VIP_ALICE');
    expect(localStorage.getItem(licenseVerifier.LICENSE_STORAGE_KEY)).toBe('MOCK_VALID_LICENSE_KEY.SIG');

    const badge = document.getElementById('titlebar-license-badge');
    expect(badge?.classList.contains('licensed')).toBe(true);
    expect(badge?.textContent).toContain('已授权 (Tier 3)');
  });

  it('输入非法或篡改激活码应当展示验签失败错误', async () => {
    vi.spyOn(licenseVerifier, 'verifyLicenseCode').mockRejectedValue(
      new Error('数字签名无效，激活码被篡改或伪造')
    );

    await modal.open();
    const inputArea = document.getElementById('activation-input-code') as HTMLTextAreaElement;
    inputArea.value = 'TAMPERED_KEY.SIG';

    const submitBtn = document.getElementById('activation-do-activate-btn');
    submitBtn?.click();

    await vi.waitFor(() => {
      const feedback = document.getElementById('activation-feedback');
      return feedback?.classList.contains('error');
    });

    const feedback = document.getElementById('activation-feedback');
    expect(feedback?.textContent).toContain('数字签名无效，激活码被篡改或伪造');
  });

  it('checkAndEnforceLicense() 无凭证时阻断拦截并弹出模态框', async () => {
    const isLicensed = await modal.checkAndEnforceLicense();
    expect(isLicensed).toBe(false);
    expect(modal.getIsOpen()).toBe(true);
  });

  it('checkAndEnforceLicense() 本地有合法凭证时静默通过', async () => {
    localStorage.setItem(licenseVerifier.LICENSE_STORAGE_KEY, 'SAVED_VALID_KEY.SIG');
    vi.spyOn(licenseVerifier, 'verifyLicenseCode').mockResolvedValue({
      v: 1,
      uid: 'E804-62DB-86BA-555E',
      exp: 0, // 永久
      user_id: 'LIFETIME_BOB',
      tier: 3,
    });

    const isLicensed = await modal.checkAndEnforceLicense();
    expect(isLicensed).toBe(true);
    expect(modal.getIsOpen()).toBe(false);

    const badge = document.getElementById('titlebar-license-badge');
    expect(badge?.classList.contains('licensed')).toBe(true);
  });
});
