// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  RedundantEdgeCanvasAdapter,
  renderRedundantEdgeCanvas,
} from './redundant-edge-canvas-adapter';
import { buildRedundantSteps } from '../../../algorithms/categories/graph/redundant-edge-step-compiler';

describe('RedundantEdgeCanvasAdapter (LC 684 Canvas Contract)', () => {
  it('应当能将步骤正确渲染为纯净 SVG 画布且不夹带 table 或 h1-h6', () => {
    const steps = buildRedundantSteps();
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderRedundantEdgeCanvas(container, step);
      expect(container.querySelector('svg')).not.toBeNull();
      expect(container.querySelector('table')).toBeNull();
      expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6').length).toBe(0);
      expect(container.textContent).not.toContain('🎯 状态');
      expect(container.textContent).not.toContain('🎯 决策');
    }
  });

  it('适配器静态类 render 方法调用一致性', () => {
    const steps = buildRedundantSteps();
    const container = document.createElement('div');
    RedundantEdgeCanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('p:');
  });
});
