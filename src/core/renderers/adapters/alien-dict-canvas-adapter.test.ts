// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { AlienDictCanvasAdapter } from './alien-dict-canvas-adapter';
import { buildAlienDictSteps } from '../../../algorithms/categories/graph/alien-dict-step-compiler';

describe('AlienDictCanvasAdapter', () => {
  it('应当能正确为合法词表渲染纯 SVG 画布且无 HTML 表格污染', () => {
    const steps = buildAlienDictSteps('valid');
    expect(steps.length).toBeGreaterThan(0);

    const container = document.createElement('div');
    AlienDictCanvasAdapter.render(container, steps[0]);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('viewBox="0 0 360 210"');
    expect(container.innerHTML).toContain('graph-node');
    expect(container.innerHTML).not.toContain('<table');
  });

  it('应当能正确为拓扑完成态渲染节点状态', () => {
    const steps = buildAlienDictSteps('valid');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    AlienDictCanvasAdapter.render(container, lastStep);

    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('入度:0');
  });
});
