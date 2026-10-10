/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  renderMst027Canvas,
  renderMst027CustomMetrics,
  Mst027CanvasAdapter,
} from './mst-kruskal-prim-027-canvas-adapter';
import { buildMst027Steps } from '../../../algorithms/categories/graph/mst-kruskal-prim-027-step-compiler';

describe('Mst027CanvasAdapter', () => {
  it('should render pure SVG without wrapping div in Card 1 container', () => {
    const container = document.createElement('div');
    const steps = buildMst027Steps();
    expect(steps.length).toBeGreaterThan(0);

    renderMst027Canvas(container, steps[0]);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(container.querySelector('div')).toBeNull();
  });

  it('should render custom metrics in Card 2 with edge queue chips', () => {
    const container = document.createElement('div');
    const steps = buildMst027Steps();
    const doneStep = steps[steps.length - 1];

    renderMst027CustomMetrics(container, doneStep);
    expect(container.innerHTML).toContain('边权升序队列');
    expect(container.innerHTML).toContain('MST 总权值 = 6');
  });

  it('should correctly mount, update and dispose via Mst027CanvasAdapter', () => {
    const container = document.createElement('div');
    const steps = buildMst027Steps();
    const adapter = new Mst027CanvasAdapter();

    adapter.mount(container);
    adapter.updateStep(container, steps[0]);
    expect(container.querySelectorAll('.graph-node').length).toBe(4);

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
