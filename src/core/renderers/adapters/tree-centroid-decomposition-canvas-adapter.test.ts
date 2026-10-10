/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderTreeCentroidCanvas,
  renderTreeCentroidCustomMetrics,
  TreeCentroidDecompositionCanvasAdapter,
} from './tree-centroid-decomposition-canvas-adapter';
import { buildStaticCentroidSteps } from '../../../algorithms/categories/graph/tree-centroid-decomposition-step-compiler';

describe('TreeCentroidDecompositionCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_7node preset', () => {
    const steps = buildStaticCentroidSteps('classic_7node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderTreeCentroidCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(7);
    expect(container.querySelectorAll('line').length).toBe(6);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for line_5node preset', () => {
    const steps = buildStaticCentroidSteps('line_5node');
    const container = document.createElement('div');
    renderTreeCentroidCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.querySelectorAll('line').length).toBe(4);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with sz, maxSubtree, vis rows and isolated centroid set', () => {
    const steps = buildStaticCentroidSteps('classic_7node');
    const container = document.createElement('div');
    renderTreeCentroidCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('sz[] (子树大小)');
    expect(container.textContent).toContain('maxSubtree[] (最大块)');
    expect(container.textContent).toContain('vis[] (重心隔离)');
    expect(container.textContent).toContain('当前已隔离重心集合');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new TreeCentroidDecompositionCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildStaticCentroidSteps('classic_7node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('sz[]');
    adapter.dispose();
  });
});
