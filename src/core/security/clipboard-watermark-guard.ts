/**
 * 全域剪贴板划词复制动态盲水印守卫 (Clipboard Watermark Guard)
 *
 * 职责：
 * 1. 监听全局 `copy` 事件；
 * 2. 当用户在客户端中用鼠标划词选中文本并执行复制（Ctrl+C 或右键复制）时，
 *    读取当前合法买家身份标识，将不可见的 Unicode 零宽盲水印织入选中文本中；
 * 3. 写入系统剪贴板，使外泄文本天然具备买家特征，支持通过 `npm run leak:investigate` 溯源实锤；
 * 4. 零破坏性：不影响正常复制粘贴的使用体验与纯文本语义。
 */

import { injectWatermarkIntoText } from './zero-width-watermark';
import { clientActivationModal } from './client-activation-modal';
import { getStoredLicense, verifyLicenseCode } from './license-verifier';

let isGuardActive = false;
let copyListener: ((e: ClipboardEvent) => void) | null = null;

/**
 * 获取当前合法的买家身份标识，兜底返回匿名标识
 */
export async function resolveCurrentBuyerIdentifier(): Promise<string> {
  // 1. 优先从内存已加载凭证获取
  const modalPayload = clientActivationModal.getCurrentPayload();
  if (modalPayload && modalPayload.user_id) {
    return modalPayload.user_id;
  }

  // 2. 尝试从本地持久化凭证恢复
  const storedCode = getStoredLicense();
  if (storedCode) {
    try {
      const verified = await verifyLicenseCode(storedCode);
      if (verified && verified.user_id) {
        return verified.user_id;
      }
    } catch {
      // 凭证未通过校验
    }
  }

  // 3. 兜底标识
  return 'buyer:unlicensed_client';
}

/**
 * 处理全局剪贴板复制事件
 */
export function handleClipboardCopy(
  e: ClipboardEvent,
  buyerResolver: () => Promise<string> = resolveCurrentBuyerIdentifier
): void {
  if (!e.clipboardData) return;

  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  const selectedText = selection ? selection.toString() : '';

  // 仅对超过 4 个字符的有效文本注入盲水印，避免单字符操作干扰
  if (!selectedText || selectedText.trim().length < 4) {
    return;
  }

  e.preventDefault();

  // 同步尝试获取或使用当前已知标识
  let buyer = 'buyer:client';
  const modalPayload = clientActivationModal.getCurrentPayload();
  if (modalPayload && modalPayload.user_id) {
    buyer = modalPayload.user_id;
  }

  const watermarkedText = injectWatermarkIntoText(selectedText, buyer);
  e.clipboardData.setData('text/plain', watermarkedText);

  // 异步二次解析最新持久化状态备用
  buyerResolver().catch(() => {});
}

/**
 * 启动全域剪贴板划词盲水印守护器
 */
export function setupClipboardWatermarkGuard(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  if (isGuardActive && copyListener) {
    return () => teardownClipboardWatermarkGuard();
  }

  copyListener = (e: ClipboardEvent) => {
    handleClipboardCopy(e);
  };

  document.addEventListener('copy', copyListener);
  isGuardActive = true;

  return () => teardownClipboardWatermarkGuard();
}

/**
 * 卸载全域剪贴板划词盲水印守护器
 */
export function teardownClipboardWatermarkGuard(): void {
  if (typeof document !== 'undefined' && copyListener) {
    document.removeEventListener('copy', copyListener);
  }
  copyListener = null;
  isGuardActive = false;
}

/**
 * 查询当前守卫是否处于激活状态
 */
export function isClipboardGuardActive(): boolean {
  return isGuardActive;
}
