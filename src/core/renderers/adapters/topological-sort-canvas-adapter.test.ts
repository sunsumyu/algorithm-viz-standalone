// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  TopologicalSortCanvasAdapter,
  renderTopologicalSortCanvas,
} from './topological-sort-canvas-adapter';
import { buildTopoSteps } from '../../../algorithms/categories/graph/topological-sort-step-compiler';

describe('TopologicalSortCanvasAdapter (Kahn DAG Canvas Contract)', () => {
  it('应当能将步骤正确渲染为纯净 SVG 画布且不夹带 table 或 h1-h6', () => {
    const steps = buildTopoSteps();
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderTopologicalSortCanvas(container, step);
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.querySelector('table')).toBeNull();
      expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6').length).toBe(0);
      expect(container.textContent).not.toContain('🎯 状态');
      expect(container.textContent).not.toContain('🎯 决策');
    }
  });

  it('适配器静态类 render 方法调用一致性', () => {
    const steps = buildTopoSteps();
    const container = document.createElement('div');
    TopologicalSortCanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('in:');
  });
});
