/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PanelBoundsEngine } from './panel-bounds-engine';

describe('PanelBoundsEngine 领域服务门禁测试', () => {
  let card: HTMLDivElement;

  beforeEach(() => {
    card = document.createElement('div');
    card.className = 'dsp-card';
    document.body.appendChild(card);
  });

  afterEach(() => {
    card.remove();
  });

  it('空卡片或者 null 返回安全基准高度 180', () => {
    expect(PanelBoundsEngine.computeNaturalHeight(null)).toBe(180);
    expect(PanelBoundsEngine.computeNaturalHeight(card)).toBe(160);
  });

  it('包含 Header, Metrics, Custom, LiveText 时精确累加高度', () => {
    const header = document.createElement('div');
    header.className = 'dsp-card-header';
    Object.defineProperty(header, 'offsetHeight', { value: 34, configurable: true });
    card.appendChild(header);

    const metrics = document.createElement('div');
    metrics.className = 'dsp-metrics-grid';
    metrics.innerHTML = '<div>item1</div><div>item2</div>';
    Object.defineProperty(metrics, 'offsetHeight', { value: 44, configurable: true });
    card.appendChild(metrics);

    const custom = document.createElement('div');
    custom.id = 'dsp-custom-metrics-container';
    const row = document.createElement('div');
    Object.defineProperty(row, 'offsetHeight', { value: 36, configurable: true });
    custom.appendChild(row);
    card.appendChild(custom);

    const liveText = document.createElement('div');
    liveText.id = 'dsp-live-text';
    Object.defineProperty(liveText, 'offsetHeight', { value: 32, configurable: true });
    card.appendChild(liveText);

    const naturalH = PanelBoundsEngine.computeNaturalHeight(card);
    // 24 (padding) + 34+6 + 44+6 + 36+6 + 32+8 = 24 + 40 + 50 + 42 + 40 = 196
    expect(naturalH).toBe(196);
  });

  it('ensureContentFitted 当当前高度小于自然高度时自动自愈撑开', () => {
    Object.defineProperty(card, 'offsetHeight', { value: 150, configurable: true });
    // 注入子元素让自然高度为 192
    const header = document.createElement('div');
    header.className = 'dsp-card-header';
    Object.defineProperty(header, 'offsetHeight', { value: 34, configurable: true });
    card.appendChild(header);

    const metrics = document.createElement('div');
    metrics.className = 'dsp-metrics-grid';
    metrics.innerHTML = '<div>item1</div>';
    Object.defineProperty(metrics, 'offsetHeight', { value: 44, configurable: true });
    card.appendChild(metrics);

    PanelBoundsEngine.ensureContentFitted(card);
    expect(card.style.height).toBe('160px'); // 基础高度
  });

  describe('Card 2 拖拽棘轮防线 (height:100% 滚动盒谎言拦截)', () => {
    it('client 撑高的自定义容器 (height:100%) 严禁把自身盒高计入自然高度——否则 splitter minSize 永远等于现值形成单向棘轮', () => {
      const custom = document.createElement('div');
      custom.id = 'dsp-custom-metrics-container';
      custom.style.height = '100%';
      custom.style.overflowY = 'auto';
      const row = document.createElement('div');
      Object.defineProperty(row, 'offsetHeight', { value: 140, configurable: true });
      custom.appendChild(row);
      card.appendChild(custom);

      // 模拟真实浏览器谎言：height:100% 拉伸盒的 scrollHeight = clientHeight（≈ 卡片当前高度），
      // 而非真实内容高度。此前实现直接采信 scrollHeight，导致 Card 2 只能拖大、永远拖不小。
      Object.defineProperty(custom, 'scrollHeight', { value: 900, configurable: true });
      Object.defineProperty(custom, 'clientHeight', { value: 900, configurable: true });

      const header = document.createElement('div');
      header.className = 'dsp-card-header';
      Object.defineProperty(header, 'offsetHeight', { value: 38, configurable: true });
      card.appendChild(header);

      // 24 + (38+6) + (140+6) = 214 —— 严禁被谎言值 900 污染
      expect(PanelBoundsEngine.computeNaturalHeight(card)).toBe(214);
    });

    it('自定义容器含真实溢出内容 (scrollHeight > 子项和) 时仍须完整计高防截断', () => {
      const custom = document.createElement('div');
      custom.id = 'dsp-custom-metrics-container';
      const row = document.createElement('div');
      Object.defineProperty(row, 'offsetHeight', { value: 140, configurable: true });
      custom.appendChild(row);
      card.appendChild(custom);
      // 未设 height:100% 的普通流容器，scrollHeight 才是可信的真实内容高度
      Object.defineProperty(custom, 'scrollHeight', { value: 200, configurable: true });

      // 24 + 200：容器自身无拉伸，scrollHeight 200 为真实溢出内容 → 取 200
      expect(PanelBoundsEngine.computeNaturalHeight(card)).toBe(24 + 200);
    });
  });
});
