// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { TarjanSCCDagCanvasAdapter } from './tarjan-scc-dag-canvas-adapter';
import { buildTarjanSCCSteps } from '../../../algorithms/categories/graph/tarjan-scc-dag-step-compiler';

describe('TarjanSCCDagCanvasAdapter', () => {
  it('应当能正确为 5 节点经典拓扑渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildTarjanSCCSteps('classic_5node');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    TarjanSCCDagCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('viewBox="0 0 470 200"');
    expect(container.innerHTML).toContain('graph-node');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当在完成态正确渲染两个 SCC 超节点与跨分量 DAG 缩点边', () => {
    const steps = buildTarjanSCCSteps('classic_5node');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    TarjanSCCDagCanvasAdapter.render(container, lastStep);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('SCC #1');
    expect(container.innerHTML).toContain('SCC #2');
    expect(container.innerHTML).toContain('dag-condensed-edge');
  });
});
