import { describe, it, expect } from 'vitest';
import { renderArrayPreviewHtml, type HoverTooltipState } from './hover-tooltip-manager';
import type { ResolvedVariable } from '../../variable-context-resolver';

describe('HoverTooltipManager - renderArrayPreviewHtml', () => {
  it('正确将二维 DP 数组中的未填 null 渲染为 0，并高亮聚焦 [i][j] 单元格', () => {
    const resolved: ResolvedVariable = {
      name: 'dp',
      value: '[1][0] = 0',
      type: 'expression',
      detail: '当前单元格 dp[1][0] = 0',
      raw: [
        [null, null, null],
        [null, 10, null],
        [null, null, null],
      ],
    };

    const state: HoverTooltipState = {
      currentVarsMap: new Map([
        ['i', { name: 'i', value: '1', type: 'number' }],
        ['j', { name: 'j', value: '0', type: 'number' }],
      ]),
      currentLang: 'java',
    };

    const html = renderArrayPreviewHtml(resolved, state);

    expect(html).toContain('二维状态矩阵 [3×3]');
    expect(html).toContain('未计算填 0');
    expect(html).toContain('聚焦 [1][0]');
    // 单元格中应包含 0 和已计算的值 10
    expect(html).toContain('>0</td>');
    expect(html).toContain('>10</td>');
    // 高亮聚焦单元格应有 #38bdf8 边框样式
    expect(html).toContain('border: 1px solid #38bdf8');
  });

  it('正确将一维滚动数组中的未填 null 渲染为 0，并高亮聚焦 [j] 槽位', () => {
    const resolved: ResolvedVariable = {
      name: 'dp',
      value: '[2] = 15',
      type: 'expression',
      detail: '当前一维状态 dp[2] = 15',
      raw: [0, null, 15, null],
    };

    const state: HoverTooltipState = {
      currentVarsMap: new Map([
        ['j', { name: 'j', value: '2', type: 'number' }],
      ]),
      currentLang: 'java',
    };

    const html = renderArrayPreviewHtml(resolved, state);

    expect(html).toContain('一维状态数组 (长 4)');
    expect(html).toContain('聚焦 [2]');
    expect(html).toContain('>15</span>');
    expect(html).toContain('>0</span>');
  });

  it('非数组或空数组时返回空字符串', () => {
    const state: HoverTooltipState = {
      currentVarsMap: new Map(),
      currentLang: 'java',
    };

    expect(renderArrayPreviewHtml({ name: 'n', value: '5', type: 'number' }, state)).toBe('');
    expect(renderArrayPreviewHtml({ name: 'arr', value: '[]', type: 'array', raw: [] }, state)).toBe('');
  });
});
