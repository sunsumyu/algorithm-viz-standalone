// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { BFS01CanvasAdapter } from './bfs-01-canvas-adapter';
import { buildBFS01Steps } from '../../../algorithms/categories/graph/bfs-01-step-compiler';

describe('BFS01CanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 600, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
  });

  it('正确渲染 5 节点经典拓扑与双端队列初始态', () => {
    const steps = buildBFS01Steps('classic_5node');
    expect(steps.length).toBeGreaterThan(0);

    BFS01CanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.graph-node');
    expect(nodes.length).toBe(5);
    expect(container.textContent).toContain('到达终点耗费');
    expect(container.textContent).toContain('Deque 队列');
  });

  it('正确渲染出队考察与终态最短路径', () => {
    const steps = buildBFS01Steps('classic_5node');
    const finalStep = steps[steps.length - 1];

    BFS01CanvasAdapter.render(container, finalStep);
    expect(finalStep.status).toBe('done');
    expect(container.textContent).toContain('到达终点耗费: 1');
  });
});
