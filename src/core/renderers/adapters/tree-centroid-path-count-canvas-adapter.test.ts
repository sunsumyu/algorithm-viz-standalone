/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderTreeCentroidPathCountCanvas,
  renderTreeCentroidPathCountCustomMetrics,
  TreeCentroidPathCountCanvasAdapter,
} from './tree-centroid-path-count-canvas-adapter';
import { buildTreeCentroidPathCountSteps } from '../../../algorithms/categories/graph/tree-centroid-path-count-step-compiler';

describe('TreeCentroidPathCountCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for threshold K=5', () => {
    const steps = buildTreeCentroidPathCountSteps(5);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderTreeCentroidPathCountCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(13); // 7 nodes + 6 edge weight badges
    expect(container.querySelectorAll('line').length).toBe(6);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for threshold K=3', () => {
    const steps = buildTreeCentroidPathCountSteps(3);
    const container = document.createElement('div');
    renderTreeCentroidPathCountCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(13);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with centroid, distPool, and inclusion-exclusion formula', () => {
    const steps = buildTreeCentroidPathCountSteps(5);
    const container = document.createElement('div');
    renderTreeCentroidPathCountCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('当前分治重心');
    expect(container.textContent).toContain('距离池升序');
    expect(container.textContent).toContain('容斥去重公式');
    expect(container.textContent).toContain('合法点对');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new TreeCentroidPathCountCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildTreeCentroidPathCountSteps(5);
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('容斥去重公式');
    adapter.dispose();
  });
});
