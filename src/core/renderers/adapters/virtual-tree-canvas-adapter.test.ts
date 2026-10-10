/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderVirtualTreeCanvas,
  renderVirtualTreeCustomMetrics,
  VirtualTreeCanvasAdapter,
} from './virtual-tree-canvas-adapter';
import { buildVirtualTreeSteps } from '../../../algorithms/categories/graph/virtual-tree-step-compiler';

describe('VirtualTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_7node preset', () => {
    const steps = buildVirtualTreeSteps('classic_7node');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderVirtualTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for simple_chain preset', () => {
    const steps = buildVirtualTreeSteps('simple_chain');
    const container = document.createElement('div');
    renderVirtualTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with dfn, depth, stack, and vtree monitor', () => {
    const steps = buildVirtualTreeSteps('classic_7node');
    const container = document.createElement('div');
    renderVirtualTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('dfn[]');
    expect(container.textContent).toContain('depth[]');
    expect(container.textContent).toContain('单调栈维护最右链');
    expect(container.textContent).toContain('当前虚树浓缩节点集');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new VirtualTreeCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildVirtualTreeSteps('classic_7node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('dfn[]');
    adapter.dispose();
  });
});
