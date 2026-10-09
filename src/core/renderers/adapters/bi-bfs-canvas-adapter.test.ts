// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { BiBFSCanvasAdapter } from './bi-bfs-canvas-adapter';
import { buildBiBFSSteps } from '../../../algorithms/categories/graph/bi-bfs-step-compiler';

describe('BiBFSCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 600, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
  });

  it('正确渲染经典 6 词接龙网络与初始双向波前', () => {
    const steps = buildBiBFSSteps('classic_word');
    expect(steps.length).toBeGreaterThan(0);

    BiBFSCanvasAdapter.render(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.word-node');
    expect(nodes.length).toBe(7);
    expect(container.textContent).toContain('正向波前: 1 词');
    expect(container.textContent).toContain('对向波前: 1 词');
  });

  it('在碰撞与终态下渲染相遇标记与接龙全路径', () => {
    const steps = buildBiBFSSteps('classic_word');
    const finalStep = steps[steps.length - 1];

    BiBFSCanvasAdapter.render(container, finalStep);
    expect(finalStep.status).toBe('done');
    expect(container.textContent).toContain('碰撞相遇于 "dot"');
    expect(container.textContent).toContain('总转换步数: 5');
  });
});
