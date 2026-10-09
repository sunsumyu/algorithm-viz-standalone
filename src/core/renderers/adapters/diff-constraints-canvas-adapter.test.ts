// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { DiffConstraintsCanvasAdapter } from './diff-constraints-canvas-adapter';
import { buildDiffConstraintsSteps } from '../../../algorithms/categories/graph/diff-constraints-step-compiler';

describe('DiffConstraintsCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders SVG canvas for feasible constraints step', () => {
    const steps = buildDiffConstraintsSteps('feasible');
    expect(steps.length).toBeGreaterThan(0);

    DiffConstraintsCanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.diff-node');
    expect(nodes.length).toBe(4); // 0, 1, 2, 3

    const edges = container.querySelectorAll('.diff-edge');
    expect(edges.length).toBeGreaterThan(0);
  });

  it('renders SVG canvas for cycle constraints step and flags negative cycle state', () => {
    const steps = buildDiffConstraintsSteps('cycle');
    const finalStep = steps[steps.length - 1];
    expect(finalStep.hasNegativeCycle).toBe(true);

    DiffConstraintsCanvasAdapter.render(container, finalStep);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Verify SVG contains rendered nodes
    const nodes = container.querySelectorAll('.diff-node');
    expect(nodes.length).toBe(4);
  });
});
