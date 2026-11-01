/**
 * 可见防截屏平铺水印覆盖层 (Visible Watermark Overlay)
 *
 * 职责：
 * 1. 在应用全视口平铺半透明倾斜水印文本（授权身份 + 授权详情 + 日期），
 *    对截屏 / 拍照 / 录屏外泄形成显性威慑与溯源标记；
 * 2. pointer-events: none + 超高层 z-index，对交互与渲染零干扰；
 * 3. 自愈守护：MutationObserver 监听水印节点被移除即秒级重建，
 *    并周期性重断言样式，对抗运行时篡改；
 * 4. 身份热更新：登录 / 激活状态变化时即时刷新水印文本。
 */

const WATERMARK_ELEMENT_ID = 'alg-viz-visible-watermark';
const REASSERT_INTERVAL_MS = 10000;

export interface VisibleWatermarkOptions {
  /** 平铺单元宽度 px */
  tileWidth?: number;
  /** 平铺单元高度 px */
  tileHeight?: number;
  /** 倾斜角度（负数为逆时针） */
  rotateDeg?: number;
  /** 整体不透明度 0~1 */
  opacity?: number;
  /** 刷新周期文案（默认自动取当前日期） */
  dateText?: string;
}

export class VisibleWatermarkOverlay {
  private overlayEl: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private reassertTimer: ReturnType<typeof setInterval> | null = null;
  private identityText = '';
  private options: Required<VisibleWatermarkOptions>;

  constructor(options: VisibleWatermarkOptions = {}) {
    this.options = {
      tileWidth: options.tileWidth ?? 420,
      tileHeight: options.tileHeight ?? 240,
      rotateDeg: options.rotateDeg ?? -24,
      opacity: options.opacity ?? 0.05,
      dateText: options.dateText ?? '',
    };
  }

  /**
   * 设置/更新水印身份文本；空串表示未授权（仅保留日期兜底水印）
   */
  public setIdentityText(text: string): void {
    this.identityText = text.trim();
    this.refresh();
  }

  public getIdentityText(): string {
    return this.identityText;
  }

  /**
   * 启动覆盖层与自愈守护
   */
  public start(): void {
    if (typeof document === 'undefined') return;
    this.ensureOverlay();
    this.startSelfHeal();
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.reassertTimer) {
      clearInterval(this.reassertTimer);
      this.reassertTimer = null;
    }
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  /**
   * 依据当前身份重建水印内容（登录 / 激活状态变化时调用）
   */
  public refresh(): void {
    if (!this.overlayEl) return;
    const dateText = this.options.dateText || new Date().toISOString().slice(0, 10);
    const lines = this.identityText ? [this.identityText, dateText] : [dateText];
    this.overlayEl.style.backgroundImage = this.buildTileDataUrl(lines.join('  ·  '));
  }

  private ensureOverlay(): void {
    let el = document.getElementById(WATERMARK_ELEMENT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = WATERMARK_ELEMENT_ID;
      document.body.appendChild(el);
    }
    this.overlayEl = el;
    this.applyStyles(el);
    this.refresh();
  }

  private applyStyles(el: HTMLElement): void {
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '2147483000';
    el.style.backgroundRepeat = 'repeat';
    el.style.opacity = String(this.options.opacity);
    el.style.userSelect = 'none';
  }

  /**
   * 生成平铺水印 SVG data-url（单元内倾斜排布，重复平铺铺满全屏）
   */
  private buildTileDataUrl(text: string): string {
    const { tileWidth, tileHeight, rotateDeg } = this.options;
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const cx = tileWidth / 2;
    const cy = tileHeight / 2;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}">` +
      `<text x="${cx}" y="${cy}" transform="rotate(${rotateDeg} ${cx} ${cy})" ` +
      `text-anchor="middle" dominant-baseline="middle" ` +
      `fill="#475569" fill-opacity="0.55" font-size="13" font-family="system-ui, sans-serif">` +
      `${safeText}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  /**
   * 自愈守护：节点被移除立即重建 + 周期性重断言样式
   */
  private startSelfHeal(): void {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if (!document.getElementById(WATERMARK_ELEMENT_ID)) {
        this.ensureOverlay();
      }
    });
    this.observer.observe(document.body, { childList: true });

    this.reassertTimer = setInterval(() => {
      if (this.overlayEl) {
        this.applyStyles(this.overlayEl);
      }
    }, REASSERT_INTERVAL_MS);
  }
}

export const visibleWatermark = new VisibleWatermarkOverlay();
