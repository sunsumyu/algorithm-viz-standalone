// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { MinCostMaxFlowCanvasAdapter } from './min-cost-max-flow-canvas-adapter';
import { buildMCMFSteps } from '../../../algorithms/categories/graph/min-cost-max-flow-step-compiler';

describe('MinCostMaxFlowCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders SVG canvas for standard network preset', () => {
    const steps = buildMCMFSteps('standard');
    expect(steps.length).toBeGreaterThan(0);

    MinCostMaxFlowCanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.mcmf-node');
    expect(nodes.length).toBe(4); // S, A, B, T

    const edges = container.querySelectorAll('.mcmf-edge');
    expect(edges.length).toBe(5);
  });

  it('renders SVG canvas for simple network preset and tracks total cost', () => {
    const steps = buildMCMFSteps('simple');
    const finalStep = steps[steps.length - 1];
    expect(finalStep.totalFlow).toBe(2);
    expect(finalStep.totalCost).toBe(6);

    MinCostMaxFlowCanvasAdapter.render(container, finalStep);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.mcmf-node');
    expect(nodes.length).toBe(4);
  });
});
