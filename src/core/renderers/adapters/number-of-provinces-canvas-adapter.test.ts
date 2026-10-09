// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderProvincesCanvas } from './number-of-provinces-canvas-adapter';
import { buildProvincesSteps } from '../../../algorithms/categories/graph/number-of-provinces-step-compiler';

describe('number-of-provinces-canvas-adapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 600, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
  });

  it('正确渲染初始状态与各城市节点', () => {
    const matrix = [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 1]
    ];
    const steps = buildProvincesSteps(matrix);
    expect(steps.length).toBeGreaterThan(0);

    renderProvincesCanvas(container, steps[0]);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const nodes = container.querySelectorAll('.city-node');
    expect(nodes.length).toBe(3);
    expect(container.textContent).toContain('城市总数: 3');
    expect(container.textContent).toContain('独立省份: 3');
  });

  it('在合并与终态下渲染连通边与省份收敛值', () => {
    const matrix = [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 1]
    ];
    const steps = buildProvincesSteps(matrix);
    const finalStep = steps[steps.length - 1];

    renderProvincesCanvas(container, finalStep);
    expect(container.textContent).toContain('独立省份: 2');
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });
});
