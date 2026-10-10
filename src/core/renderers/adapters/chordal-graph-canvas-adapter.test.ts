/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderChordalGraphCanvas,
  renderChordalGraphCustomMetrics,
  ChordalGraphCanvasAdapter,
} from './chordal-graph-canvas-adapter';
import { buildChordalGraphSteps } from '../../../algorithms/categories/graph/chordal-graph-step-compiler';

describe('ChordalGraphCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for chordal preset', () => {
    const steps = buildChordalGraphSteps('chordal');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderChordalGraphCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(container.querySelectorAll('line').length).toBe(5);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for non-chordal preset', () => {
    const steps = buildChordalGraphSteps('non-chordal');
    const container = document.createElement('div');
    renderChordalGraphCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with peo, rankOrder, label, and vis array slots', () => {
    const steps = buildChordalGraphSteps('chordal');
    const container = document.createElement('div');
    renderChordalGraphCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('peo[]');
    expect(container.textContent).toContain('rankOrder[]');
    expect(container.textContent).toContain('label[]');
    expect(container.textContent).toContain('vis[]');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new ChordalGraphCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildChordalGraphSteps('chordal');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('peo[]');
    adapter.dispose();
  });
});
