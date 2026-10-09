// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderLayeredDijkstraCanvas,
  LayeredDijkstraCanvasAdapter,
} from './layered-dijkstra-canvas-adapter';
import { buildLayeredDijkstraSteps } from '../../../algorithms/categories/graph/layered-dijkstra-step-compiler';

describe('LayeredDijkstraCanvasAdapter', () => {
  it('应当能正确为分层图步骤渲染纯净双层拓扑 SVG 沙盘', () => {
    const steps = buildLayeredDijkstraSteps('p4568_standard');
    const container = document.createElement('div');

    // 初始步
    renderLayeredDijkstraCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');
    expect(container.innerHTML).toContain('0,0');
    expect(container.innerHTML).toContain('0,1');

    // 跨层松弛步
    const relaxStep = steps.find((s) => s.highlightEdge?.isFree) || steps[5];
    LayeredDijkstraCanvasAdapter.render(container, relaxStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('免(0)');

    // 终态步
    const doneStep = steps[steps.length - 1];
    LayeredDijkstraCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('d:4');
  });

  it('应当能正确支持 3 城市简易分层图拓扑', () => {
    const steps = buildLayeredDijkstraSteps('simple_3node');
    const container = document.createElement('div');

    const doneStep = steps[steps.length - 1];
    LayeredDijkstraCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('d:0');
  });
});
