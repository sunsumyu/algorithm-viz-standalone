// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { DinicMaxFlowCanvasAdapter } from './dinic-max-flow-canvas-adapter';
import { buildDinicSteps } from '../../../algorithms/categories/graph/dinic-max-flow-step-compiler';

describe('DinicMaxFlowCanvasAdapter', () => {
  it('应当能正确为菱形网络渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildDinicSteps('diamond');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    DinicMaxFlowCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('btn-dinic-2d');
    expect(container.innerHTML).toContain('btn-dinic-3d');
    expect(container.innerHTML).toContain('graph-node');
    expect(container.innerHTML).toContain('graph-edge');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当能正确处理 3D 视图模式切换挂载容器', () => {
    const steps = buildDinicSteps('cross');
    const container = document.createElement('div');
    (container as any)._dinicMode = '3d';

    DinicMaxFlowCanvasAdapter.render(container, steps[2]);

    expect(container.innerHTML).toContain('dinic-3d-canvas-container');
    expect(container.innerHTML).toContain('🪐 3D 沙盘');
    expect(container.innerHTML).not.toContain('<table');
  });
});
