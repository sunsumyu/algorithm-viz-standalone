/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderGraphTreeKnapCanvas,
  renderGraphTreeKnapCustomMetrics,
  GraphTreeKnapsackDPCanvasAdapter,
} from './graph-tree-knapsack-dp-canvas-adapter';
import { buildTreeKnapsackSteps } from '../../../algorithms/categories/graph/tree-knapsack-dp-step-compiler';

describe('GraphTreeKnapsackDPCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for V=3 preset', () => {
    const steps = buildTreeKnapsackSteps(3);
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const container = document.createElement('div');
    renderGraphTreeKnapCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(6);
    expect(container.querySelectorAll('line').length).toBe(5);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for initial step', () => {
    const steps = buildTreeKnapsackSteps(4);
    const container = document.createElement('div');
    renderGraphTreeKnapCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with DP state vector and recurrence formula', () => {
    const steps = buildTreeKnapsackSteps(3);
    const container = document.createElement('div');
    renderGraphTreeKnapCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('树上 DP 状态向量');
    expect(container.textContent).toContain('泛化物品合并转移');
    expect(container.textContent).toContain('dp[u][j]');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('supports lifecycle adapter methods mount, updateStep, renderCustomMetrics, dispose', () => {
    const adapter = new GraphTreeKnapsackDPCanvasAdapter();
    const container = document.createElement('div');
    adapter.mount(container);
    const steps = buildTreeKnapsackSteps(3);
    adapter.updateStep(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    adapter.renderCustomMetrics(container, steps[steps.length - 1]);
    expect(container.textContent).toContain('树上 DP 状态向量');
    adapter.dispose();
  });
});
