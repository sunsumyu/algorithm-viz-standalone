/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderGraphTreeDiffCanvas,
  renderGraphTreeDiffCustomMetrics,
  GraphTreeDifferenceCanvasAdapter,
} from './graph-tree-difference-canvas-adapter';
import { buildTreeDifferenceSteps } from '../../../algorithms/categories/graph/tree-difference-step-compiler';

describe('GraphTreeDifferenceCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for node_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('node_diff_5node');
    expect(steps.length).toBeGreaterThan(15);

    const container = document.createElement('div');
    renderGraphTreeDiffCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for edge_diff_5node preset', () => {
    const steps = buildTreeDifferenceSteps('edge_diff_5node');
    const container = document.createElement('div');
    renderGraphTreeDiffCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with depth, diff, and val rows', () => {
    const steps = buildTreeDifferenceSteps('node_diff_5node');
    const container = document.createElement('div');
    renderGraphTreeDiffCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('depth[]');
    expect(container.textContent).toContain('diff[]');
    expect(container.textContent).toContain('val[]');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new GraphTreeDifferenceCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildTreeDifferenceSteps('node_diff_5node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('depth[]');
    adapter.dispose();
  });
});
