// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { ForwardStarCanvasAdapter } from './forward-star-canvas-adapter';
import { buildForwardStarSteps } from '../../../algorithms/categories/graph/forward-star-step-compiler';

describe('ForwardStarCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 600, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
  });

  it('正确渲染加边模式初始态与内存池图示', () => {
    const rawEdges = '1 2 5, 1 3 2, 2 4 1';
    const steps = buildForwardStarSteps(rawEdges, '1', 'build');
    expect(steps.length).toBeGreaterThan(0);

    ForwardStarCanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.graph-node');
    expect(nodes.length).toBeGreaterThanOrEqual(4);
    expect(container.textContent).toContain('模式: ⚡ 头插建图');
    expect(container.textContent).toContain('已录入边数: 0');
  });

  it('正确渲染遍历模式与已访问出边高亮', () => {
    const rawEdges = '1 2 5, 1 3 2, 1 4 9';
    const steps = buildForwardStarSteps(rawEdges, '1', 'traverse');
    const finalStep = steps[steps.length - 1];

    ForwardStarCanvasAdapter.render(container, finalStep);
    expect(finalStep.action).toBe('traverse_done');
    expect(container.textContent).toContain('模式: 🔍 出边遍历');
  });
});
