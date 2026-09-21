import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  renderStageTabsHtml,
  renderModeBarHtml,
  renderInputsHtml,
  renderMetricsHtml,
  renderLegendHtml,
  resolveHeaderContext,
} from './declarative-stage-fragments';
import type { DeclarativeAlgorithmSpec } from './declarative-stage-spec';

// 与 declarative-stage-presenter.test.ts 一致的 localStorage mock 策略
let mockStorage: Record<string, string>;
function installMockStorage() {
  mockStorage = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  };
}
function removeMockStorage() {
  delete (globalThis as any).localStorage;
}

describe('renderStageTabsHtml', () => {
  it('should emit a single default "standard" tab when no stages are defined', () => {
    const html = renderStageTabsHtml(undefined, undefined);
    expect(html).toContain('id="stage-tabs-container"');
    expect(html).toContain('data-stage="standard"');
    expect(html).toContain('dsp-stage-tab-btn');
    expect(html).toContain('标准');
    expect(html).toContain('active');
  });

  it('should emit an active tab for the "standard" fallback when activeStageId is undefined', () => {
    const html = renderStageTabsHtml([], undefined);
    expect(html).toContain('data-stage="standard"');
    expect(html).toContain('active');
  });

  it('should render one button per stage with correct data-stage and number', () => {
    const html = renderStageTabsHtml(
      [
        { id: 'stage-1', name: '阶段 1', shortName: '递归', num: 1 },
        { id: 'stage-2', name: '阶段 2', shortName: '记忆化', num: 2 },
        { id: 'stage-3', name: '阶段 3', shortName: '二维 DP', num: 3 },
      ],
      'stage-2'
    );
    expect(html).toContain('data-stage="stage-1"');
    expect(html).toContain('data-stage="stage-2"');
    expect(html).toContain('data-stage="stage-3"');
    // 阶段数字
    expect(html).toContain('<span class="dsp-stage-num">1</span>');
    expect(html).toContain('<span class="dsp-stage-num">2</span>');
    expect(html).toContain('<span class="dsp-stage-num">3</span>');
  });

  it('should mark only the active stage button with the active class', () => {
    const html = renderStageTabsHtml(
      [
        { id: 'stage-1', name: '阶段 1', shortName: '递归' },
        { id: 'stage-2', name: '阶段 2', shortName: '记忆化' },
      ],
      'stage-2'
    );
    // 仅 active 的按钮带 active 类
    const activeCount = (html.match(/class="dsp-stage-tab-btn active/g) || []).length;
    expect(activeCount).toBe(1);
    // stage-2 使用蓝色主题
    expect(html).toContain('class="dsp-stage-tab-btn active bg-blue" data-stage="stage-2"');
  });

  it('should apply bg-emerald theme for active stage-3', () => {
    const html = renderStageTabsHtml(
      [{ id: 'stage-3', name: '阶段 3', shortName: '二维 DP', num: 3 }],
      'stage-3'
    );
    expect(html).toContain('active bg-emerald');
  });

  it('should apply bg-amber theme for active stage-4', () => {
    const html = renderStageTabsHtml(
      [{ id: 'stage-4', name: '阶段 4', shortName: '一维优化', num: 4 }],
      'stage-4'
    );
    expect(html).toContain('active bg-amber');
  });

  it('should fall back to defaultShortNames for stage ids without shortName', () => {
    const html = renderStageTabsHtml(
      [{ id: 'stage-1', name: '阶段 1', shortName: '' }],
      'stage-1'
    );
    expect(html).toContain('递归');
  });

  it('should fall back to "阶段 N" label when neither shortName nor default exists', () => {
    const html = renderStageTabsHtml(
      [{ id: 'custom-a', name: '', shortName: '' }],
      'custom-a'
    );
    expect(html).toContain('阶段 1');
  });

  it('should include timeBadge in title attribute when present', () => {
    const html = renderStageTabsHtml(
      [{ id: 'stage-1', name: '递归', shortName: '递归', timeBadge: 'O(2ⁿ)' }],
      'stage-1'
    );
    expect(html).toContain('O(2ⁿ)');
  });
});

describe('renderModeBarHtml', () => {
  it('should return empty string for empty modes', () => {
    expect(renderModeBarHtml(undefined)).toBe('');
    expect(renderModeBarHtml([])).toBe('');
  });

  it('should render forward/reverse tabs with arrow symbols and dir-tab-btn class', () => {
    const html = renderModeBarHtml([
      { id: 'forward', label: '顺推' },
      { id: 'reverse', label: '逆推' },
    ], 'forward');
    expect(html).toContain('dir-tabs-container');
    expect(html).toContain('dir-tab-btn');
    expect(html).toContain('data-mode="forward"');
    expect(html).toContain('data-mode="reverse"');
    expect(html).toContain('顺推');
    expect(html).toContain('逆推');
  });

  it('should mark only active mode with active class', () => {
    const html = renderModeBarHtml([
      { id: 'forward', label: '顺推' },
      { id: 'reverse', label: '逆推' },
    ], 'reverse');
    const activeCount = (html.match(/class="dir-tab-btn dsp-mode-chip[^"]*active/g) || []).length;
    expect(activeCount).toBe(1);
    // Check that the reverse button has the active class
    expect(html).toContain('active bg-blue-600 text-white shadow-sm font-bold border-blue-600" data-mode="reverse"');
  });

  it('should strip parenthetical suffix from custom mode labels in visible text', () => {
    const html = renderModeBarHtml([
      { id: 'custom', label: '标准模式(自动)' },
    ], 'custom');
    // 可见文本应去除括号后缀
    expect(html).toContain('<span class="truncate">标准模式</span>');
    // title 属性保留完整标签用于提示
    expect(html).toContain('title="标准模式(自动)"');
  });
});

describe('renderInputsHtml', () => {
  it('should render number and text inputs with correct widths', () => {
    const html = renderInputsHtml([
      { id: 'n', label: '数字:', type: 'number', defaultValue: 10, width: '45px' },
      { id: 't', label: '文本', type: 'text', defaultValue: 'hi', width: '120px' },
    ]);
    expect(html).toContain('style="width: 45px;"');
    expect(html).toContain('style="width: 120px;"');
    expect(html).toContain('id="n"');
    expect(html).toContain('id="t"');
    expect(html).toContain('数字');
    expect(html).toContain('文本');
  });

  it('should strip trailing colon from label', () => {
    const html = renderInputsHtml([
      { id: 'n', label: '数字:', type: 'number', defaultValue: 10 },
    ]);
    expect(html).toContain('数字:');
    // 标签后不应再有裸冒号(已归一化为 label + 冒号)
    expect(html).toContain('>数字:</label>');
  });

  it('should default to 110px width when not specified', () => {
    const html = renderInputsHtml([
      { id: 'n', label: '数字', type: 'number', defaultValue: 10 },
    ]);
    expect(html).toContain('style="width: 110px;"');
  });

  it('should render select inputs with options', () => {
    const html = renderInputsHtml([
      {
        id: 's',
        label: '选择',
        type: 'select',
        defaultValue: 'a',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    ]);
    expect(html).toContain('<select id="s"');
    expect(html).toContain('<option value="a">A</option>');
    expect(html).toContain('<option value="b">B</option>');
  });
});

describe('renderMetricsHtml', () => {
  it('should render metric cards with metric- prefixed IDs and colors', () => {
    const html = renderMetricsHtml([
      { id: 'cnt', label: '计数', color: '#2563eb' },
    ]);
    expect(html).toContain('dsp-metric-card');
    expect(html).toContain('id="metric-cnt"');
    expect(html).toContain('style="color: #2563eb;"');
    expect(html).toContain('计数');
    expect(html).toContain('—');
  });

  it('should preserve metric- prefix when id already prefixed', () => {
    const html = renderMetricsHtml([
      { id: 'metric-ans', label: '结果' },
    ]);
    expect(html).toContain('id="metric-ans"');
  });

  it('should return empty string for empty metrics', () => {
    expect(renderMetricsHtml(undefined)).toBe('');
    expect(renderMetricsHtml([])).toBe('');
  });
});

describe('renderLegendHtml', () => {
  it('should render legend dots with explicit colors', () => {
    const html = renderLegendHtml([
      { label: '可达', color: '#22c55e' },
    ]);
    expect(html).toContain('dsp-legend-dot');
    expect(html).toContain('background: #22c55e;');
    expect(html).toContain('可达');
  });

  it('should resolve semantic state token via resolveLegendDotColor', () => {
    const html = renderLegendHtml([
      { label: '当前', state: 'pivot' },
    ]);
    // 语义状态必须解析为具体色值，不能输出 "state"
    expect(html).toContain('background: #');
    expect(html).not.toContain('background: current');
    expect(html).not.toContain('undefined');
  });

  it('should return empty string for empty legend', () => {
    expect(renderLegendHtml(undefined)).toBe('');
  });
});

describe('resolveHeaderContext', () => {
  const spec = (overrides: Partial<DeclarativeAlgorithmSpec> = {}): DeclarativeAlgorithmSpec => ({
    id: 'test-algo',
    name: '测试算法',
    category: 'test',
    card1Title: '全局沙盘',
    card2Title: '全局监控',
    card2Desc: '全局描述',
    badge: { mode: '全局模式', complexity: 'O(n)' },
    ...overrides,
  });

  beforeEach(() => {
    installMockStorage();
  });

  afterEach(() => {
    removeMockStorage();
  });

  it('should return default card titles when no stages or stage overrides', () => {
    const ctx = resolveHeaderContext(spec());
    expect(ctx.card1Title).toBe('全局沙盘');
    expect(ctx.card2Title).toBe('全局监控');
    expect(ctx.card2Desc).toBe('全局描述');
    expect(ctx.modeBadge).toBe('全局模式');
    expect(ctx.complexityBadge).toBe('O(n)');
  });

  it('should recall saved stage from localStorage', () => {
    mockStorage['algo-stage-test-algo'] = 'stage-2';
    const ctx = resolveHeaderContext(
      spec({
        stages: [
          { id: 'stage-1', name: '阶段 1', shortName: '递归' },
          { id: 'stage-2', name: '阶段 2', shortName: '记忆化' },
        ],
      })
    );
    expect(ctx.curStageId).toBe('stage-2');
  });

  it('should fall back to defaultStage when no saved stage', () => {
    const ctx = resolveHeaderContext(
      spec({
        defaultStage: 'stage-3',
        stages: [
          { id: 'stage-1', name: '阶段 1', shortName: '递归' },
          { id: 'stage-3', name: '阶段 3', shortName: '二维 DP' },
        ],
      })
    );
    expect(ctx.curStageId).toBe('stage-3');
  });

  it('should prefer stage-level card titles over spec-level', () => {
    const ctx = resolveHeaderContext(
      spec({
        defaultStage: 'stage-2',
        stages: [
          {
            id: 'stage-2',
            name: '阶段 2',
            shortName: '记忆化',
            card1Title: '阶段沙盘',
            card2Title: '阶段监控',
            card2Desc: '阶段描述',
          },
        ],
      })
    );
    expect(ctx.card1Title).toBe('阶段沙盘');
    expect(ctx.card2Title).toBe('阶段监控');
    expect(ctx.card2Desc).toBe('阶段描述');
  });

  it('should prefer stage badge over spec badge', () => {
    const ctx = resolveHeaderContext(
      spec({
        defaultStage: 'stage-1',
        stages: [
          { id: 'stage-1', name: '阶段 1', shortName: '递归', badge: { mode: '阶段模式', complexity: 'O(2ⁿ)' } },
        ],
      })
    );
    expect(ctx.modeBadge).toBe('阶段模式');
    expect(ctx.complexityBadge).toBe('O(2ⁿ)');
  });
});