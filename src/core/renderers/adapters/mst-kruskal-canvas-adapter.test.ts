// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { MstKruskalCanvasAdapter, renderMstKruskalCanvas } from './mst-kruskal-canvas-adapter';
import { buildKruskalSteps, type KruskalStep } from '../../../algorithms/categories/graph/mst-kruskal-step-compiler';

describe('MstKruskalCanvasAdapter', () => {
  it('应当渲染纯净 SVG 拓扑沙盘且无内联表格', () => {
    const steps = buildKruskalSteps();
    const container = document.createElement('div');

    MstKruskalCanvasAdapter.render(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.innerHTML).not.toContain('<table');
    expect(container.innerHTML).not.toContain('<h1');
    expect(container.innerHTML).not.toContain('<h2');
    expect(container.innerHTML).not.toContain('<h3');
  });

  it('应当在加边和判环阶段正确更新边样式', () => {
    const steps = buildKruskalSteps();
    const container = document.createElement('div');

    const acceptStep = steps.find(s => s.action === 'accept') || steps[steps.length - 1];
    renderMstKruskalCanvas(container, acceptStep);
    expect(container.querySelector('svg')).not.toBeNull();

    const doneStep = steps[steps.length - 1];
    renderMstKruskalCanvas(container, doneStep);
    expect(container.innerHTML).toContain('stroke="#10b981"');
  });
});
