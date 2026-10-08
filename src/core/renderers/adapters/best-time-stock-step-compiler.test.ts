// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildStockSteps } from './best-time-stock-step-compiler';
import { renderBestTimeStockCanvas } from './best-time-stock-canvas-adapter';

describe('BestTimeStockStepCompiler', () => {
  it('handles short array gracefully', () => {
    const steps = buildStockSteps([5]);
    expect(steps.length).toBe(1);
    expect(steps[0].phase).toBe('done');
    expect(steps[0].totalProfit).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates greedy profits', () => {
    const steps = buildStockSteps([7, 1, 5, 3, 6, 4]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].phase).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.phase).toBe('done');
    expect(last.totalProfit).toBe(7);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const emptySteps = buildStockSteps([]);
    renderBestTimeStockCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('输入为空');

    const steps = buildStockSteps([7, 1, 5]);
    renderBestTimeStockCanvas(container, steps[2]);
    expect(container.innerHTML).toContain('svg');
    expect(container.innerHTML).toContain('line');
  });
});
