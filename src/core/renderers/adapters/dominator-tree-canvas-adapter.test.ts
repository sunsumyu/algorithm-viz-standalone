/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderDominatorTreeCanvas,
  renderDominatorTreeCustomMetrics,
} from './dominator-tree-canvas-adapter';
import { buildDominatorTreeSteps } from '../../../algorithms/categories/graph/dominator-tree-step-compiler';

describe('DominatorTreeCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for classic diamond preset', () => {
    const steps = buildDominatorTreeSteps('classic_diamond');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderDominatorTreeCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for linear bypass preset', () => {
    const steps = buildDominatorTreeSteps('linear_bypass');
    const container = document.createElement('div');
    renderDominatorTreeCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with inDegree, idom, and depth monitor', () => {
    const steps = buildDominatorTreeSteps('classic_diamond');
    const container = document.createElement('div');
    renderDominatorTreeCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('inDegree[]');
    expect(container.textContent).toContain('idom[]');
    expect(container.textContent).toContain('拓扑排序队列');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });
});
