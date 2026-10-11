/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderDFSTheoryCanvas,
  renderDFSTheoryCustomMetrics,
  DFSTheoryCanvasAdapter,
} from './dfs-theory-canvas-adapter';
import { buildDFSSteps } from '../../../algorithms/categories/graph/dfs-theory-step-compiler';

describe('DFSTheoryCanvasAdapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas in Card 1 with all nodes and edges', () => {
    const steps = buildDFSSteps();
    renderDFSTheoryCanvas(container, steps[0]);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 600 300');
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    const nodes = container.querySelectorAll('.dfs-node-group');
    expect(nodes.length).toBe(6);
  });

  it('highlights current node and recursion stack depth', () => {
    const steps = buildDFSSteps();
    const visitStep = steps.find((s) => s.action === 'visit' && s.currentNode === 1);
    expect(visitStep).toBeDefined();

    renderDFSTheoryCanvas(container, visitStep!);
    expect(container.innerHTML).toContain('当前光标');
    expect(container.innerHTML).toContain('栈帧深度');
  });

  it('renders recursion stack and traversal order in Card 2 metrics', () => {
    const steps = buildDFSSteps();
    const midStep = steps[3];
    renderDFSTheoryCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('调用栈状态 (Recursion Stack)');
    expect(container.innerHTML).toContain('访问序列 (Traversal Order)');
    expect(container.innerHTML).toContain('已覆盖顶点');
  });

  it('mounts, updates and disposes properly via adapter class', () => {
    const adapter = new DFSTheoryCanvasAdapter();
    const steps = buildDFSSteps();

    adapter.mount(container);
    expect(container.innerHTML).toBe('');

    adapter.updateStep(container, steps[1]);
    expect(container.querySelector('svg')).not.toBeNull();

    adapter.dispose(container);
    expect(container.innerHTML).toBe('');
  });
});
