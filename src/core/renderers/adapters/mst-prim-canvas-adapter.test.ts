// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { MstPrimCanvasAdapter, renderMstPrimCanvas } from './mst-prim-canvas-adapter';
import { buildPrimSteps, type PrimStep } from '../../../algorithms/categories/graph/mst-prim-step-compiler';

describe('MstPrimCanvasAdapter', () => {
  it('应当渲染纯净 SVG 拓扑沙盘且无内联表格', () => {
    const steps = buildPrimSteps();
    const container = document.createElement('div');

    MstPrimCanvasAdapter.render(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.innerHTML).not.toContain('<table');
    expect(container.innerHTML).not.toContain('<h1');
    expect(container.innerHTML).not.toContain('<h2');
    expect(container.innerHTML).not.toContain('<h3');
  });

  it('应当在加点和切边更新阶段正确更新节点与边样式', () => {
    const steps = buildPrimSteps();
    const container = document.createElement('div');

    const selectStep = steps.find(s => s.action === 'select') || steps[1];
    renderMstPrimCanvas(container, selectStep);
    expect(container.querySelector('svg')).not.toBeNull();

    const doneStep = steps[steps.length - 1];
    renderMstPrimCanvas(container, doneStep);
    expect(container.innerHTML).toContain('stroke="#10b981"');
  });
});
