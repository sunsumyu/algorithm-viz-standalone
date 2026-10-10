/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderLCABinaryLiftingCanvas,
  renderLCABinaryLiftingCustomMetrics,
  LCABinaryLiftingCanvasAdapter,
} from './lca-binary-lifting-canvas-adapter';
import { buildLCASteps } from '../../../algorithms/categories/graph/lca-binary-lifting-step-compiler';

describe('LCABinaryLiftingCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_7node preset', () => {
    const steps = buildLCASteps('classic_7node');
    expect(steps.length).toBeGreaterThan(15);

    const container = document.createElement('div');
    renderLCABinaryLiftingCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for fork_5node preset', () => {
    const steps = buildLCASteps('fork_5node');
    const container = document.createElement('div');
    renderLCABinaryLiftingCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with depth, up0, up1, and dist monitor', () => {
    const steps = buildLCASteps('classic_7node');
    const container = document.createElement('div');
    renderLCABinaryLiftingCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('depth[]');
    expect(container.textContent).toContain('up[u][0]');
    expect(container.textContent).toContain('up[u][1]');
    expect(container.textContent).toContain('两点树上最短距离');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new LCABinaryLiftingCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildLCASteps('classic_7node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('depth[]');
    adapter.dispose();
  });
});
