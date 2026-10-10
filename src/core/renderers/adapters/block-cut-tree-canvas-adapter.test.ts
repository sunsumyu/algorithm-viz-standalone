/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderBlockCutTreeCanvas,
  renderBlockCutTreeCustomMetrics,
  BlockCutTreeCanvasAdapter,
} from './block-cut-tree-canvas-adapter';
import { buildBlockCutTreeSteps } from '../../../algorithms/categories/graph/block-cut-tree-step-compiler';

describe('BlockCutTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_6node preset', () => {
    const steps = buildBlockCutTreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderBlockCutTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for simple_4node preset', () => {
    const steps = buildBlockCutTreeSteps('simple_4node');
    const container = document.createElement('div');
    renderBlockCutTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with dfn, low, and stack monitor', () => {
    const steps = buildBlockCutTreeSteps('classic_6node');
    const container = document.createElement('div');
    renderBlockCutTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('dfn[]');
    expect(container.textContent).toContain('low[]');
    expect(container.textContent).toContain('Tarjan 点双辅助栈');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new BlockCutTreeCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildBlockCutTreeSteps('classic_6node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('dfn[]');
    adapter.dispose();
  });
});
