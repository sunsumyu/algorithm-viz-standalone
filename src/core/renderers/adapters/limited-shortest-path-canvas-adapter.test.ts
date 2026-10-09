// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderLimitedShortestPathCanvas,
  LimitedShortestPathCanvasAdapter,
} from './limited-shortest-path-canvas-adapter';
import { buildLSPSteps } from '../../../algorithms/categories/graph/limited-shortest-path-step-compiler';

describe('LimitedShortestPathCanvasAdapter', () => {
  it('应当能正确为有限最短路步骤渲染纯净航班拓扑 SVG 沙盘', () => {
    const steps = buildLSPSteps();
    const container = document.createElement('div');

    // 初始步
    renderLimitedShortestPathCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');
    expect(container.innerHTML).toContain('(S)');
    expect(container.innerHTML).toContain('(D)');

    // 松弛成功步
    const relaxStep = steps.find((s) => s.action === 'relax-success') || steps[1];
    LimitedShortestPathCanvasAdapter.render(container, relaxStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('url(#lsp-arrow-green)');

    // 轮次完成步
    const roundStep = steps.find((s) => s.action === 'round-done') || steps[8];
    LimitedShortestPathCanvasAdapter.render(container, roundStep);
    expect(container.innerHTML).toContain('<svg');

    // 终态步
    const doneStep = steps[steps.length - 1];
    LimitedShortestPathCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('d:9');
  });
});
