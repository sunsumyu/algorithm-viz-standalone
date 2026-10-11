/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderGraphTheoryCanvas,
  renderGraphTheoryCustomMetrics,
  GraphTheoryCanvasAdapter,
} from './graph-theory-canvas-adapter';
import { buildGraphTheorySteps } from '../../../algorithms/categories/graph/graph-theory-step-compiler';

describe('GraphTheoryCanvasAdapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas in Card 1 with pentagon topology nodes', () => {
    const steps = buildGraphTheorySteps();
    renderGraphTheoryCanvas(container, steps[0]);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 600 300');
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    const nodes = container.querySelectorAll('.gt-node-group');
    expect(nodes.length).toBe(5);
  });

  it('highlights dynamic add and remove edges', () => {
    const steps = buildGraphTheorySteps();
    const addStep = steps.find((s) => s.highlightAction === 'add');
    expect(addStep).toBeDefined();

    renderGraphTheoryCanvas(container, addStep!);
    expect(container.querySelector('line[stroke="#10b981"]')).not.toBeNull();

    const removeStep = steps.find((s) => s.highlightAction === 'remove');
    expect(removeStep).toBeDefined();

    renderGraphTheoryCanvas(container, removeStep!);
    expect(container.querySelector('line[stroke="#ef4444"]')).not.toBeNull();
  });

  it('renders matrix and list representations in Card 2 metrics', () => {
    const steps = buildGraphTheorySteps();
    renderGraphTheoryCustomMetrics(container, steps[1]);

    expect(container.innerHTML).toContain('邻接矩阵');
    expect(container.innerHTML).toContain('邻接表');
    expect(container.innerHTML).toContain('顶点总数 (V)');
    expect(container.innerHTML).toContain('边总数 (E)');
  });

  it('mounts, updates and disposes properly via adapter class', () => {
    const adapter = new GraphTheoryCanvasAdapter();
    const steps = buildGraphTheorySteps();

    adapter.mount(container);
    expect(container.innerHTML).toBe('');

    adapter.updateStep(container, steps[2]);
    expect(container.querySelector('svg')).not.toBeNull();

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
