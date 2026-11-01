// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VisibleWatermarkOverlay, visibleWatermark } from './visible-watermark';

const WATERMARK_ELEMENT_ID = 'alg-viz-visible-watermark';

describe('VisibleWatermarkOverlay (可见防截屏平铺水印)', () => {
  let overlay: VisibleWatermarkOverlay;

  beforeEach(() => {
    document.body.innerHTML = '';
    overlay = new VisibleWatermarkOverlay();
  });

  afterEach(() => {
    overlay.stop();
    visibleWatermark.stop();
  });

  it('start() 应当在 body 上创建 pointer-events 为 none 的全视口覆盖层', () => {
    overlay.start();
    const el = document.getElementById(WATERMARK_ELEMENT_ID);
    expect(el).not.toBeNull();
    expect(el!.style.pointerEvents).toBe('none');
    expect(el!.style.position).toBe('fixed');
    expect(el!.style.backgroundRepeat).toBe('repeat');
  });

  it('设置身份后水印应平铺为 SVG data-url 且包含身份与日期信息', () => {
    overlay.setIdentityText('138****8000 · 试用期剩余 7 天');
    overlay.start();
    const el = document.getElementById(WATERMARK_ELEMENT_ID)!;
    expect(el.style.backgroundImage).toContain('data:image/svg+xml');
    const decoded = decodeURIComponent(el.style.backgroundImage);
    expect(decoded).toContain('138****8000');
    // 默认日期文案 (YYYY-MM-DD)
    expect(decoded).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('身份热更新应即时刷新水印内容', () => {
    overlay.start();
    overlay.setIdentityText('old-user');
    expect(decodeURIComponent(document.getElementById(WATERMARK_ELEMENT_ID)!.style.backgroundImage)).toContain('old-user');

    overlay.setIdentityText('new-user');
    expect(decodeURIComponent(document.getElementById(WATERMARK_ELEMENT_ID)!.style.backgroundImage)).toContain('new-user');
  });

  it('水印身份中的 XML 特殊字符应被转义，杜绝破坏 SVG 结构', () => {
    overlay.start();
    overlay.setIdentityText('<script>alert(1)</script> & "quotes"');
    const decoded = decodeURIComponent(
      document.getElementById(WATERMARK_ELEMENT_ID)!.style.backgroundImage
    );
    expect(decoded).toContain('&lt;script&gt;');
    expect(decoded).not.toContain('<script>');
  });

  it('水印节点被移除后应自愈重建 (MutationObserver 守护)', async () => {
    overlay.start();
    expect(document.getElementById(WATERMARK_ELEMENT_ID)).not.toBeNull();

    document.getElementById(WATERMARK_ELEMENT_ID)!.remove();
    expect(document.getElementById(WATERMARK_ELEMENT_ID)).toBeNull();

    // MutationObserver 回调在微任务后触发
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.getElementById(WATERMARK_ELEMENT_ID)).not.toBeNull();
  });

  it('stop() 应当清理节点与守护定时器', () => {
    overlay.start();
    overlay.stop();
    expect(document.getElementById(WATERMARK_ELEMENT_ID)).toBeNull();
  });

  it('未授权（空身份）时仍保留日期兜底水印', () => {
    visibleWatermark.start();
    visibleWatermark.setIdentityText('');
    const decoded = decodeURIComponent(
      document.getElementById(WATERMARK_ELEMENT_ID)!.style.backgroundImage
    );
    expect(decoded).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
