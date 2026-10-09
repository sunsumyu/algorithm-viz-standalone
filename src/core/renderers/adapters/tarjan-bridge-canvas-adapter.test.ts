// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { TarjanBridgeCanvasAdapter } from './tarjan-bridge-canvas-adapter';
import { buildTarjanBridgeSteps } from '../../../algorithms/categories/graph/tarjan-bridge-step-compiler';

describe('TarjanBridgeCanvasAdapter', () => {
  it('应当能正确为 5 节点图渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildTarjanBridgeSteps('classic_5node');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    TarjanBridgeCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('viewBox="0 0 390 190"');
    expect(container.innerHTML).toContain('graph-node');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当在完成态正确渲染割点与桥边高亮标记', () => {
    const steps = buildTarjanBridgeSteps('classic_5node');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    TarjanBridgeCanvasAdapter.render(container, lastStep);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('cut-node');
    expect(container.innerHTML).toContain('bridge-edge');
    expect(container.innerHTML).toContain('桥边');
  });
});
