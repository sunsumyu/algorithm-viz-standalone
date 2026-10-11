/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderBFSTheoryCanvas,
  renderBFSTheoryCustomMetrics,
  BFSTheoryCanvasAdapter,
} from './bfs-theory-canvas-adapter';
import { buildBFSSteps } from '../../../algorithms/categories/graph/bfs-theory-step-compiler';

describe('BFSTheoryCanvasAdapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas in Card 1 with all nodes and layer dividers', () => {
    const steps = buildBFSSteps();
    renderBFSTheoryCanvas(container, steps[0]);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 600 300');
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    const nodes = container.querySelectorAll('.bfs-node-group');
    expect(nodes.length).toBe(6);
    expect(container.innerHTML).toContain('Level 0');
  });

  it('highlights currently scanning node and queue status', () => {
    const steps = buildBFSSteps();
    const dequeueStep = steps.find((s) => s.action === 'dequeue' && s.currentNode === 1);
    expect(dequeueStep).toBeDefined();

    renderBFSTheoryCanvas(container, dequeueStep!);
    expect(container.innerHTML).toContain('当前扫描');
  });

  it('renders FIFO queue and layered order sequence in Card 2 metrics', () => {
    const steps = buildBFSSteps();
    const midStep = steps[4];
    renderBFSTheoryCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('先进先出队列 (FIFO Queue)');
    expect(container.innerHTML).toContain('分层遍历序列 (Layered Order)');
    expect(container.innerHTML).toContain('Level');
  });

  it('mounts, updates and disposes properly via adapter class', () => {
    const adapter = new BFSTheoryCanvasAdapter();
    const steps = buildBFSSteps();

    adapter.mount(container);
    expect(container.innerHTML).toBe('');

    adapter.updateStep(container, steps[1]);
    expect(container.querySelector('svg')).not.toBeNull();

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
