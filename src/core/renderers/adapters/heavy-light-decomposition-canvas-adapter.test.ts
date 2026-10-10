/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderHLDCanvas,
  renderHLDCustomMetrics,
  HeavyLightDecompositionCanvasAdapter,
} from './heavy-light-decomposition-canvas-adapter';
import { buildHLDSteps } from '../../../algorithms/categories/graph/heavy-light-decomposition-step-compiler';

describe('HeavyLightDecompositionCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_6node preset', () => {
    const steps = buildHLDSteps('classic_6node');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderHLDCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for line_4node preset', () => {
    const steps = buildHLDSteps('line_4node');
    const container = document.createElement('div');
    renderHLDCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with size, son, top, and dfn monitor', () => {
    const steps = buildHLDSteps('classic_6node');
    const container = document.createElement('div');
    renderHLDCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('size[]');
    expect(container.textContent).toContain('son[]');
    expect(container.textContent).toContain('top[]');
    expect(container.textContent).toContain('dfn[]');
    expect(container.textContent).toContain('转化线段树区间集');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new HeavyLightDecompositionCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildHLDSteps('classic_6node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('size[]');
    adapter.dispose();
  });
});
