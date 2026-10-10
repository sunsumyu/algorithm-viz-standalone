/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderMinMeanCycleCanvas,
  renderMinMeanCycleCustomMetrics,
  MinMeanCycleCanvasAdapter,
} from './min-mean-cycle-canvas-adapter';
import { buildMinMeanCycleSteps } from '../../../algorithms/categories/graph/min-mean-cycle-step-compiler';

describe('MinMeanCycleCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for four-nodes graph', () => {
    const steps = buildMinMeanCycleSteps('four-nodes');
    expect(steps.length).toBeGreaterThanOrEqual(18);

    const container = document.createElement('div');
    renderMinMeanCycleCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(container.querySelectorAll('line').length).toBe(5);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for three-nodes graph', () => {
    const steps = buildMinMeanCycleSteps('three-nodes');
    const container = document.createElement('div');
    renderMinMeanCycleCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(container.querySelectorAll('line').length).toBe(3);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with bounds, guess-lambda, and cycle status', () => {
    const steps = buildMinMeanCycleSteps('four-nodes');
    const container = document.createElement('div');
    renderMinMeanCycleCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('二分逼近区间');
    expect(container.textContent).toContain('当前猜测平均边权 λ');
    expect(container.textContent).toContain('SPFA 负环判定');
    expect(container.textContent).toContain('0-1 分数规划判据');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new MinMeanCycleCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildMinMeanCycleSteps('four-nodes');
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('二分逼近区间');
    adapter.dispose();
  });
});
