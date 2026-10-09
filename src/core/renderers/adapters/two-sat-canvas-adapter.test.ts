// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { TwoSATCanvasAdapter } from './two-sat-canvas-adapter';
import { buildTwoSATSteps } from '../../../algorithms/categories/graph/two-sat-step-compiler';

describe('TwoSATCanvasAdapter', () => {
  it('应当能正确为可满足子句集渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildTwoSATSteps('satisfiable');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    TwoSATCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('viewBox="0 0 360 215"');
    expect(container.innerHTML).toContain('graph-node');
    expect(container.innerHTML).toContain('graph-edge');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当能正确为完成态步骤渲染 SCC 缩点徽章', () => {
    const steps = buildTwoSATSteps('satisfiable');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    TwoSATCanvasAdapter.render(container, lastStep);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('SCC:#');
  });
});
