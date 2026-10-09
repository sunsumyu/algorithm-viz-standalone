// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderKShortestPathCanvas,
  KShortestPathCanvasAdapter,
} from './k-shortest-path-canvas-adapter';
import { buildKShortestPathSteps } from '../../../algorithms/categories/graph/k-shortest-path-step-compiler';

describe('KShortestPathCanvasAdapter', () => {
  it('应当能正确为 K 短路步骤渲染纯净拓扑 SVG 沙盘', () => {
    const steps = buildKShortestPathSteps('classic_4node_k2');
    const container = document.createElement('div');

    // 初始步
    renderKShortestPathCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');
    expect(container.innerHTML).toContain('h:');

    // 活跃边步
    const activeEdgeStep = steps.find((s) => s.activeEdge) || steps[2];
    KShortestPathCanvasAdapter.render(container, activeEdgeStep);
    expect(container.innerHTML).toContain('<svg');

    // 命中终点步
    const hitStep = steps.find((s) => s.status === 'hit') || steps[10];
    KShortestPathCanvasAdapter.render(container, hitStep);
    expect(container.innerHTML).toContain('<svg');

    // 终态步
    const doneStep = steps[steps.length - 1];
    KShortestPathCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
  });

  it('应当支持 K=3 预设的拓扑沙盘渲染', () => {
    const steps = buildKShortestPathSteps('classic_4node_k3');
    const container = document.createElement('div');

    const doneStep = steps[steps.length - 1];
    KShortestPathCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
  });
});
