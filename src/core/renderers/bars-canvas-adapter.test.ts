import { describe, it, expect } from 'vitest';
import { computeBarsVisual, BarsCanvasAdapter } from './bars-canvas-adapter';

describe('computeBarsVisual (纯计算：柱状沙盘视觉推导)', () => {
  it('高度按最大值归一化：最大柱 100%', () => {
    const cells = computeBarsVisual({ values: [5, 2, 9] });
    expect(cells.map((c) => c.heightPct)).toEqual([56, 22, 100]);
  });

  it('高度下限 18%（极小值不被压扁）', () => {
    const cells = computeBarsVisual({ values: [100, 1] });
    expect(cells[0].heightPct).toBe(100);
    expect(cells[1].heightPct).toBe(18);
  });

  it('缺省状态解析为 idle 灰柱', () => {
    const cells = computeBarsVisual({ values: [3, 3] });
    expect(cells[0].bg).toBe('#cbd5e1');
    expect(cells[0].transform).toBe('none');
  });

  it('强调态 swapping 应用 emphasisScale 缩放', () => {
    const cells = computeBarsVisual({
      values: [1, 2],
      states: ['swapping', 'idle'],
      emphasisScale: 1.06,
    });
    expect(cells[0].transform).toBe('scale(1.06)');
    expect(cells[1].transform).toBe('none');
  });

  it('pivot 同为强调态；comparing / sorted 无缩放', () => {
    const cells = computeBarsVisual({
      values: [1, 2, 3, 4],
      states: ['pivot', 'comparing', 'sorted', 'idle'],
      emphasisScale: 1.05,
    });
    expect(cells[0].transform).toBe('scale(1.05)');
    expect(cells[1].transform).toBe('none');
    expect(cells[2].transform).toBe('none');
  });

  it('sorted 语义解析为绿色系（消除色值漂移）', () => {
    const cells = computeBarsVisual({ values: [1], states: ['sorted'] });
    expect(cells[0].border).toBe('#22c55e');
  });

  it('空数组返回空 cell 列表', () => {
    expect(computeBarsVisual({ values: [] })).toEqual([]);
  });

  it('states 与 values 等长对齐（短 states 尾部回退 idle）', () => {
    const cells = computeBarsVisual({ values: [1, 2, 3], states: ['sorted'] });
    expect(cells[0].border).toBe('#22c55e');
    expect(cells[1].bg).toBe('#cbd5e1');
    expect(cells[2].bg).toBe('#cbd5e1');
  });
});

describe('BarsCanvasAdapter (DOM 呈现接缝)', () => {
  it('应暴露 render 方法名（DomainAdapterCatalog 契约）', () => {
    expect(BarsCanvasAdapter.renderMethodName).toBe('render');
    expect(typeof BarsCanvasAdapter.render).toBe('function');
  });
});
