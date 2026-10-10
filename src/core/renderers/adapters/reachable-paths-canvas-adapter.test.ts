/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  renderReachablePathsCanvas,
  renderReachablePathsCustomMetrics,
  ReachablePathsCanvasAdapter,
} from './reachable-paths-canvas-adapter';
import { buildReachableSteps } from '../../../algorithms/categories/graph/reachable-paths-step-compiler';

describe('ReachablePathsCanvasAdapter', () => {
  it('should render pure SVG without wrapping div in Card 1 container', () => {
    const container = document.createElement('div');
    const steps = buildReachableSteps();
    expect(steps.length).toBeGreaterThan(0);

    renderReachablePathsCanvas(container, steps[0]);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(container.querySelector('div')).toBeNull();
  });

  it('should render custom metrics in Card 2 with path chips', () => {
    const container = document.createElement('div');
    const steps = buildReachableSteps();
    const doneStep = steps[steps.length - 1];

    renderReachablePathsCustomMetrics(container, doneStep);
    expect(container.innerHTML).toContain('已收集路径');
    expect(container.innerHTML).toContain('#1');
  });

  it('should correctly mount, update and dispose via ReachablePathsCanvasAdapter', () => {
    const container = document.createElement('div');
    const steps = buildReachableSteps();
    const adapter = new ReachablePathsCanvasAdapter();

    adapter.mount(container);
    adapter.updateStep(container, steps[0]);
    expect(container.querySelectorAll('.graph-node').length).toBe(4);

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
