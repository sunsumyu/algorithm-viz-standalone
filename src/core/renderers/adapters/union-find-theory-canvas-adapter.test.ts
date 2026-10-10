/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderUnionFindTheoryCanvas,
  renderUnionFindTheoryCustomMetrics,
  UnionFindTheoryCanvasAdapter,
} from './union-find-theory-canvas-adapter';
import { buildUnionFindTheorySteps } from '../../../algorithms/categories/graph/union-find-theory-step-compiler';

describe('UnionFindTheoryCanvasAdapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas in Card 1 with directed forest nodes', () => {
    const steps = buildUnionFindTheorySteps();
    renderUnionFindTheoryCanvas(container, steps[0]);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 640 300');
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    const nodes = container.querySelectorAll('.uft-node');
    expect(nodes.length).toBe(7);
  });

  it('renders directed edges and highlights compression step', () => {
    const steps = buildUnionFindTheorySteps();
    // Step 4 is path compression
    const compressStep = steps.find((s) => s.action === 'compress');
    expect(compressStep).toBeDefined();

    renderUnionFindTheoryCanvas(container, compressStep!);
    expect(container.querySelector('line[stroke-dasharray="4 3"]')).not.toBeNull();
  });

  it('renders parent and rank arrays in Card 2 metrics', () => {
    const steps = buildUnionFindTheorySteps();
    renderUnionFindTheoryCustomMetrics(container, steps[1]);

    expect(container.innerHTML).toContain('parent[]');
    expect(container.innerHTML).toContain('rank[]');
    expect(container.innerHTML).toContain('集合数:');
  });

  it('mounts, updates and disposes properly via adapter class', () => {
    const adapter = new UnionFindTheoryCanvasAdapter();
    const steps = buildUnionFindTheorySteps();

    adapter.mount(container);
    expect(container.innerHTML).toBe('');

    adapter.updateStep(container, steps[2]);
    expect(container.querySelector('svg')).not.toBeNull();

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
