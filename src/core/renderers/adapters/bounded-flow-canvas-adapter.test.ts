/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  renderBoundedFlowCanvas,
  renderBoundedFlowCustomMetrics,
} from './bounded-flow-canvas-adapter';
import { buildBoundedFlowSteps } from '../../../algorithms/categories/graph/bounded-flow-step-compiler';

describe('BoundedFlowCanvasAdapter', () => {
  it('renders pure SVG canvas without table or NaN styles for 4-node preset', () => {
    const steps = buildBoundedFlowSteps('four-nodes');
    expect(steps.length).toBeGreaterThan(5);

    const container = document.createElement('div');
    renderBoundedFlowCanvas(container, steps[steps.length - 1]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });

  it('renders pure SVG canvas for triangle preset', () => {
    const steps = buildBoundedFlowSteps('triangle');
    const container = document.createElement('div');
    renderBoundedFlowCanvas(container, steps[0]);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('renders custom metrics with delta and level monitor', () => {
    const steps = buildBoundedFlowSteps('four-nodes');
    const container = document.createElement('div');
    renderBoundedFlowCustomMetrics(container, steps[steps.length - 1]);

    expect(container.textContent).toContain('delta[]');
    expect(container.textContent).toContain('伴随网络满流进度');
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.innerHTML).not.toContain('undefined');
  });
});
