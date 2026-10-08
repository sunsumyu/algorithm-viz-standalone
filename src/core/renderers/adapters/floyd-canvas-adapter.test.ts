// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderFloydCanvas, FloydCanvasAdapter } from './floyd-canvas-adapter';
import { buildFloydSteps } from '../../../algorithms/categories/graph/floyd-step-compiler';

describe('FloydCanvasAdapter', () => {
  it('应当能正确为 Floyd 算法步骤渲染距离矩阵与高亮格', () => {
    const steps = buildFloydSteps();
    const container = document.createElement('div');

    // 初始矩阵
    renderFloydCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<table');
    expect(container.innerHTML).toContain('from \\ to');
    expect(container.innerHTML).toContain('∞');

    // 考察与更新步
    const updateStep = steps.find((s) => s.action === 'update') || steps[10];
    FloydCanvasAdapter.render(container, updateStep);
    expect(container.innerHTML).toContain('<table');

    // 最终步
    const doneStep = steps[steps.length - 1];
    FloydCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<table');
  });
});
