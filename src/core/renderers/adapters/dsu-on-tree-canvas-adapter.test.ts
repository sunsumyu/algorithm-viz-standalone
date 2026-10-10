/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderDSUOnTreeCanvas,
  renderDSUOnTreeCustomMetrics,
  DSUOnTreeCanvasAdapter,
} from './dsu-on-tree-canvas-adapter';
import { buildDSUOnTreeSteps } from '../../../algorithms/categories/graph/dsu-on-tree-step-compiler';

describe('DSUOnTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic_4node preset', () => {
    const steps = buildDSUOnTreeSteps('classic_4node');
    expect(steps.length).toBeGreaterThan(10);

    const container = document.createElement('div');
    renderDSUOnTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for simple_star preset', () => {
    const steps = buildDSUOnTreeSteps('simple_star');
    const container = document.createElement('div');
    renderDSUOnTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with sz, son, ans, and bucket monitor', () => {
    const steps = buildDSUOnTreeSteps('classic_4node');
    const container = document.createElement('div');
    renderDSUOnTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('sz[]');
    expect(container.textContent).toContain('son[]');
    expect(container.textContent).toContain('ans[]');
    expect(container.textContent).toContain('当前全局颜色桶');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new DSUOnTreeCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildDSUOnTreeSteps('classic_4node');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('sz[]');
    adapter.dispose();
  });
});
