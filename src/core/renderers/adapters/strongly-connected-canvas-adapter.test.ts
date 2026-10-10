/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderStronglyConnectedCanvas,
  renderStronglyConnectedCustomMetrics,
} from './strongly-connected-canvas-adapter';
import { buildSCCSteps } from '../../../algorithms/categories/graph/strongly-connected-step-compiler';

describe('StronglyConnectedCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div in Card 1', () => {
    const steps = buildSCCSteps();
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderStronglyConnectedCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点渲染
    expect(container.innerHTML).toContain('0');
    expect(container.innerHTML).toContain('1');
    expect(container.innerHTML).toContain('2');
    expect(container.innerHTML).toContain('3');
  });

  it('renders custom metrics with stage, cur-node and Kosaraju theorem compartment', () => {
    const steps = buildSCCSteps();
    const step = steps[steps.length - 1];

    renderStronglyConnectedCustomMetrics(container, step);

    expect(container.innerHTML).toContain('当前算法阶段');
    expect(container.innerHTML).toContain('当前访问节点');
    expect(container.innerHTML).toContain('Kosaraju 双向 DFS 判定定理');
  });
});
