/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  renderStateCompressionBfsCanvas,
  renderStateCompressionBfsCustomMetrics,
  StateCompressionBfsCanvasAdapter,
} from './state-compression-bfs-canvas-adapter';
import { buildStateBFSSteps } from '../../../algorithms/categories/graph/state-compression-bfs-step-compiler';

describe('StateCompressionBfsCanvasAdapter', () => {
  it('should render pure SVG without wrapping div in Card 1 container', () => {
    const container = document.createElement('div');
    const steps = buildStateBFSSteps('classic_3x3');
    expect(steps.length).toBeGreaterThan(0);

    renderStateCompressionBfsCanvas(container, steps[0]);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(container.querySelector('div')).toBeNull();
  });

  it('should render custom metrics in Card 2 with keyMask bit tags', () => {
    const container = document.createElement('div');
    const steps = buildStateBFSSteps('classic_3x3');
    const doneStep = steps[steps.length - 1];

    renderStateCompressionBfsCustomMetrics(container, doneStep);
    expect(container.innerHTML).toContain('keyMask (位图)');
    expect(container.innerHTML).toContain('当前扩维三元组');
  });

  it('should correctly mount, update and dispose via StateCompressionBfsCanvasAdapter', () => {
    const container = document.createElement('div');
    const steps = buildStateBFSSteps('simple_line');
    const adapter = new StateCompressionBfsCanvasAdapter();

    adapter.mount(container);
    adapter.updateStep(container, steps[0]);
    expect(container.querySelectorAll('.grid-cell').length).toBe(4);

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
