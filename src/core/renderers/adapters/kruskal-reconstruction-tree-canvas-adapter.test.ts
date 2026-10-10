/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderKruskalTreeCanvas,
  renderKruskalTreeCustomMetrics,
  KruskalReconstructionTreeCanvasAdapter,
} from './kruskal-reconstruction-tree-canvas-adapter';
import { buildKruskalTreeSteps } from '../../../algorithms/categories/graph/kruskal-reconstruction-tree-step-compiler';

describe('KruskalReconstructionTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_4node preset', () => {
    const steps = buildKruskalTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderKruskalTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for star_3node preset', () => {
    const steps = buildKruskalTreeSteps('star_3node');
    const container = document.createElement('div');
    renderKruskalTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with father, val, and edges monitor', () => {
    const steps = buildKruskalTreeSteps('classic_4node');
    const container = document.createElement('div');
    renderKruskalTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('father[]');
    expect(container.textContent).toContain('val[]');
    expect(container.textContent).toContain('已生成重构树边数');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new KruskalReconstructionTreeCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildKruskalTreeSteps('classic_4node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('father[]');
    adapter.dispose();
  });
});
