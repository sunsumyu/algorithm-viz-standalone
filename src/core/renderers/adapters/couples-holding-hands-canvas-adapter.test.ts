/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderCouplesHoldingHandsCanvas,
  renderCouplesHoldingHandsCustomMetrics,
} from './couples-holding-hands-canvas-adapter';
import { buildCouplesSteps } from '../../../algorithms/categories/graph/couples-holding-hands-step-compiler';

describe('CouplesHoldingHandsCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div', () => {
    const steps = buildCouplesSteps('two_cycles');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderCouplesHoldingHandsCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点 C0..C3 存在
    expect(container.innerHTML).toContain('C0');
    expect(container.innerHTML).toContain('C1');
    expect(container.innerHTML).toContain('C2');
    expect(container.innerHTML).toContain('C3');
  });

  it('renders custom metrics with couch slots and permutation cycle compartments', () => {
    const steps = buildCouplesSteps('two_cycles');
    const step = steps[steps.length - 1];

    renderCouplesHoldingHandsCustomMetrics(container, step);

    expect(container.innerHTML).toContain('沙发席位排布舱');
    expect(container.innerHTML).toContain('parent[] 代表元:');
    expect(container.innerHTML).toContain('置换环分解与理论交换舱');
    expect(container.innerHTML).toContain('最少交换 = N - Sets');
  });
});
