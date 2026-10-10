/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderPruferSequenceCanvas,
  renderPruferSequenceCustomMetrics,
  PruferSequenceCanvasAdapter,
} from './prufer-sequence-canvas-adapter';
import { buildPruferSteps } from '../../../algorithms/categories/graph/prufer-sequence-step-compiler';

describe('PruferSequenceCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for star_4node preset', () => {
    const steps = buildPruferSteps('star_4node');
    expect(steps.length).toBeGreaterThan(15);

    const container = document.createElement('div');
    renderPruferSequenceCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for line_4node preset', () => {
    const steps = buildPruferSteps('line_4node');
    const container = document.createElement('div');
    renderPruferSequenceCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with parent, deg, and prufer sequence output', () => {
    const steps = buildPruferSteps('star_4node');
    const container = document.createElement('div');
    renderPruferSequenceCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('parent[]');
    expect(container.textContent).toContain('deg[]');
    expect(container.textContent).toContain('Prufer 序列输出');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new PruferSequenceCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildPruferSteps('star_4node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('parent[]');
    adapter.dispose();
  });
});
