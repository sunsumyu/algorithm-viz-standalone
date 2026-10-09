// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { HungarianMatchingCanvasAdapter } from './hungarian-matching-canvas-adapter';
import { buildHungarianSteps } from '../../../algorithms/categories/graph/hungarian-matching-step-compiler';

describe('HungarianMatchingCanvasAdapter', () => {
  it('应当能正确为 4 节点二分图渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildHungarianSteps('four_nodes');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    HungarianMatchingCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('viewBox="0 0 380 200"');
    expect(container.innerHTML).toContain('bipartite-left-node');
    expect(container.innerHTML).toContain('bipartite-right-node');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当在完成态正确渲染所有匹配边与配对标签', () => {
    const steps = buildHungarianSteps('four_nodes');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    HungarianMatchingCanvasAdapter.render(container, lastStep);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('matched-node');
    expect(container.innerHTML).toContain('matched-edge');
  });
});
