/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderFindRouteCanvas, FindRouteCanvasAdapter } from './find-route-canvas-adapter';
import { buildFindRouteSteps, FIND_ROUTE_PRESETS } from '../../../algorithms/categories/graph/find-route-step-compiler';

describe('FindRouteCanvasAdapter', () => {
  it('should render pure SVG without wrapping div in Card 1 container', () => {
    const container = document.createElement('div');
    const steps = buildFindRouteSteps(FIND_ROUTE_PRESETS['connected-6']);
    expect(steps.length).toBeGreaterThan(0);

    renderFindRouteCanvas(container, steps[0]);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(container.querySelector('div')).toBeNull();
  });

  it('should update visual elements across steps properly', () => {
    const container = document.createElement('div');
    const steps = buildFindRouteSteps(FIND_ROUTE_PRESETS['connected-6']);
    const adapter = new FindRouteCanvasAdapter();

    adapter.mount(container);

    // Initial step
    adapter.updateStep(container, steps[0]);
    expect(container.querySelectorAll('.graph-node').length).toBe(6);

    // Found step (if reached)
    const foundStep = steps.find((s) => s.found === true);
    expect(foundStep).toBeDefined();
    if (foundStep) {
      adapter.updateStep(container, foundStep);
      expect(container.innerHTML).toContain('目标达成：两点连通');
    }

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });

  it('should correctly handle disconnected component preset', () => {
    const container = document.createElement('div');
    const steps = buildFindRouteSteps(FIND_ROUTE_PRESETS['disconnected-6']);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.found).toBe(false);
    renderFindRouteCanvas(container, lastStep);
    expect(container.innerHTML).toContain('搜索结束：两点不连通');
  });
});
