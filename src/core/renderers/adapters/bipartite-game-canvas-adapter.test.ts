// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { BipartiteGameCanvasAdapter } from './bipartite-game-canvas-adapter';
import { buildBipartiteGameSteps } from '../../../algorithms/categories/graph/bipartite-game-step-compiler';

describe('BipartiteGameCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders SVG canvas for five_nodes model preset', () => {
    const steps = buildBipartiteGameSteps('five_nodes');
    expect(steps.length).toBeGreaterThan(0);

    BipartiteGameCanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.game-node');
    expect(nodes.length).toBe(5);

    const edges = container.querySelectorAll('.bipartite-edge');
    expect(edges.length).toBe(4);
  });

  it('renders SVG canvas for six_nodes model preset with winning crown', () => {
    const steps = buildBipartiteGameSteps('six_nodes');
    const finalStep = steps[steps.length - 1];
    expect(finalStep.winningStartNodes.length).toBeGreaterThan(0);

    BipartiteGameCanvasAdapter.render(container, finalStep);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.game-node');
    expect(nodes.length).toBe(6);
  });
});
