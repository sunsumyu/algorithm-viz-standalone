/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderCentroidTreeCanvas,
  renderCentroidTreeCustomMetrics,
  CentroidTreeCanvasAdapter,
} from './centroid-tree-canvas-adapter';
import { buildCentroidTreeSteps } from '../../../algorithms/categories/graph/centroid-tree-step-compiler';

describe('CentroidTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_5node preset', () => {
    const steps = buildCentroidTreeSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderCentroidTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.querySelectorAll('line').length).toBe(4);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for simple_line preset', () => {
    const steps = buildCentroidTreeSteps('simple_line');
    const container = document.createElement('div');
    renderCentroidTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with centroid parent chain and complexity', () => {
    const steps = buildCentroidTreeSteps('classic_5node');
    const container = document.createElement('div');
    renderCentroidTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('点分树父子关系映射');
    expect(container.textContent).toContain('fa[');
    expect(container.textContent).toContain('O(log² N)');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new CentroidTreeCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildCentroidTreeSteps('classic_5node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('点分树父子关系映射');
    adapter.dispose();
  });
});
