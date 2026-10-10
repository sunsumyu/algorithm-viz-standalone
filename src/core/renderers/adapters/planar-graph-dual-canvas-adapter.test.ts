/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderPlanarGraphDualCanvas,
  renderPlanarGraphDualCustomMetrics,
  PlanarGraphDualCanvasAdapter,
} from './planar-graph-dual-canvas-adapter';
import { buildPlanarDualSteps } from '../../../algorithms/categories/graph/planar-graph-dual-step-compiler';

describe('PlanarGraphDualCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles', () => {
    const steps = buildPlanarDualSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderPlanarGraphDualCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(10); // 6 planar nodes + 4 dual nodes
    expect(container.querySelectorAll('line').length).toBeGreaterThanOrEqual(7);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders initial state pure SVG canvas', () => {
    const steps = buildPlanarDualSteps();
    const container = document.createElement('div');
    renderPlanarGraphDualCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with distMap and MinCut theorem', () => {
    const steps = buildPlanarDualSteps();
    const container = document.createElement('div');
    renderPlanarGraphDualCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('对偶面距离表');
    expect(container.textContent).toContain('平面图最小割对偶定理');
    expect(container.textContent).toContain('MinCut(S, T)');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new PlanarGraphDualCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildPlanarDualSteps();
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('MinCut');
    adapter.dispose();
  });
});
