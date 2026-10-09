// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { TopoDPCanvasAdapter, renderTopoDPCanvas } from './topo-dp-canvas-adapter';
import { buildTopoDPSteps, type TopoDPStep } from '../../../algorithms/categories/graph/topo-dp-step-compiler';

describe('TopoDPCanvasAdapter', () => {
  it('应当渲染纯净 SVG 拓扑沙盘且无内联表格与标题', () => {
    const steps = buildTopoDPSteps('classic_5node');
    const container = document.createElement('div');

    TopoDPCanvasAdapter.render(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.innerHTML).not.toContain('<table');
    expect(container.innerHTML).not.toContain('<h1');
    expect(container.innerHTML).not.toContain('<h2');
    expect(container.innerHTML).not.toContain('<h3');
  });

  it('应当在完成阶段正确高亮最长关键路径', () => {
    const steps = buildTopoDPSteps('classic_5node');
    const container = document.createElement('div');

    const doneStep = steps[steps.length - 1];
    renderTopoDPCanvas(container, doneStep);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).toContain('stroke="#10b981"');
  });
});
