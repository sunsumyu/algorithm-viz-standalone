import { describe, it, expect, vi } from 'vitest';
import {
  PresetCasePresenter,
  PresetCaseDef,
} from './preset-case-presenter';

class MockElement {
  public id: string = '';
  public value: string = '';
  public listeners: Record<string, Function[]> = {};
  public children: MockElement[] = [];

  constructor(id: string = '') {
    this.id = id;
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public dispatchEvent(event: any) {
    const type = typeof event === 'string' ? event : event?.type || 'change';
    (this.listeners[type] || []).forEach((fn) => fn(event));
  }

  public querySelector(sel: string): MockElement | null {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      if (this.id === targetId) return this;
      for (const child of this.children) {
        const found = child.querySelector(sel);
        if (found) return found;
      }
    }
    return null;
  }
}

describe('PresetCasePresenter Shared Component', () => {
  const dummyPresets: PresetCaseDef[] = [
    { label: 'LeetCode 样例 1 (基础)', values: { 'text1': 'abcde', 'text2': 'ace' }, description: '基础公共子序列' },
    { label: '全匹配样例（完全相同）', values: { 'text1': 'abc', 'text2': 'abc' } },
    { label: '无重叠样例', values: { 'text1': 'abc', 'text2': 'def' } },
  ];

  it('should return empty string when presets are empty or undefined', () => {
    expect(PresetCasePresenter.renderSelectHtml(undefined)).toBe('');
    expect(PresetCasePresenter.renderSelectHtml([])).toBe('');
  });

  it('should render compact preset select dropdown with cleaned labels and custom options', () => {
    const html = PresetCasePresenter.renderSelectHtml(dummyPresets, {
      selectId: 'custom-preset-select',
      labelText: '预设:',
      placeholder: '请选择案例...',
      maxWidth: '110px',
    });

    expect(html).toContain('id="custom-preset-select"');
    expect(html).toContain('预设:');
    expect(html).toContain('请选择案例...');
    expect(html).toContain('style="max-width: 110px; font-size: 11px;"');
    expect(html).toContain('<option value="0" title="基础公共子序列">LeetCode 样例 1</option>');
    expect(html).toContain('<option value="1">全匹配样例</option>');
    expect(html).toContain('<option value="2">无重叠样例</option>');
  });

  it('should bind change event and populate input values automatically', () => {
    const root = new MockElement('root');
    const select = new MockElement('dsp-preset-select');
    const input1 = new MockElement('text1');
    const input2 = new MockElement('text2');

    root.children.push(select, input1, input2);

    const onApply = vi.fn();
    const boundSelect = PresetCasePresenter.bindSelect(root as any, dummyPresets, onApply);

    expect(boundSelect).not.toBeNull();

    // 模拟选择第 1 个案例 (index 0)
    select.value = '0';
    select.dispatchEvent({ type: 'change' });

    expect(input1.value).toBe('abcde');
    expect(input2.value).toBe('ace');
    expect(onApply).toHaveBeenCalledWith(
      { 'text1': 'abcde', 'text2': 'ace' },
      dummyPresets[0]
    );
  });

  it('should resolve explicit presets when defined', () => {
    const res = PresetCasePresenter.resolvePresets(dummyPresets, []);
    expect(res).toBe(dummyPresets);
    expect(res.length).toBe(3);
  });

  it('should auto-infer default baseline preset from inputs when presets are missing', () => {
    const inputs = [
      { id: 'arr', defaultValue: '[1, 2, 3]', label: '输入数组' },
      { id: 'target', defaultValue: '5', label: '目标值' },
      { id: 'algo', defaultValue: 'dfs', type: 'select', options: [{ label: '深度优先', value: 'dfs' }, { label: '广度优先', value: 'bfs' }] },
    ];
    const inferred = PresetCasePresenter.resolvePresets(undefined, inputs as any);
    expect(inferred.length).toBe(2);
    expect(inferred[0].label).toContain('标准基准用例');
    expect(inferred[0].values).toEqual({ arr: '[1, 2, 3]', target: '5', algo: 'dfs' });
    expect(inferred[1].label).toContain('备选变体用例');
    expect(inferred[1].values.algo).toBe('bfs');
  });

  it('should return empty array when neither presets nor inputs are provided', () => {
    expect(PresetCasePresenter.resolvePresets(undefined, undefined)).toEqual([]);
    expect(PresetCasePresenter.resolvePresets([], [])).toEqual([]);
  });
});
