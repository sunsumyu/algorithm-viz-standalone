/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderPseudotreeDPCanvas,
  renderPseudotreeDPCustomMetrics,
  PseudotreeDPCanvasAdapter,
} from './pseudotree-dp-canvas-adapter';
import { buildPseudotreeSteps } from '../../../algorithms/categories/graph/pseudotree-dp-step-compiler';

describe('PseudotreeDPCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_6node preset', () => {
    const steps = buildPseudotreeSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderPseudotreeDPCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(6);
    expect(container.querySelectorAll('line').length).toBe(6);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for simple_5node preset', () => {
    const steps = buildPseudotreeSteps('simple_5node');
    const container = document.createElement('div');
    renderPseudotreeDPCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(5);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with dp0 and dp1 rows and selected set', () => {
    const steps = buildPseudotreeSteps('classic_6node');
    const container = document.createElement('div');
    renderPseudotreeDPCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('dp[u][0]');
    expect(container.textContent).toContain('dp[u][1]');
    expect(container.textContent).toContain('最优独立集节点集合');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new PseudotreeDPCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildPseudotreeSteps('classic_6node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('dp[u][0]');
    adapter.dispose();
  });
});
