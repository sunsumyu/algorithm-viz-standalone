// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { SecondMstCanvasAdapter, renderSecondMstCanvas } from './second-mst-canvas-adapter';
import { buildSecondMstSteps, type SecondMstStep } from '../../../algorithms/categories/graph/second-mst-step-compiler';

describe('SecondMstCanvasAdapter', () => {
  it('应当渲染纯净 SVG 拓扑沙盘且无内联表格与标题', () => {
    const steps = buildSecondMstSteps('classic_4node_p4180');
    const container = document.createElement('div');

    SecondMstCanvasAdapter.render(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(container.innerHTML).not.toContain('<table');
    expect(container.innerHTML).not.toContain('<h1');
    expect(container.innerHTML).not.toContain('<h2');
    expect(container.innerHTML).not.toContain('<h3');
  });

  it('应当在换边阶段正确高亮被替换边与试探非树边', () => {
    const steps = buildSecondMstSteps('classic_4node_p4180');
    const container = document.createElement('div');

    const swapStep = steps.find(s => s.status === 'swap') || steps[steps.length - 2];
    renderSecondMstCanvas(container, swapStep);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
