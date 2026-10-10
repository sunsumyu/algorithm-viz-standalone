/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderGoodPathsCanvas,
  renderGoodPathsCustomMetrics,
} from './good-paths-canvas-adapter';
import { buildGoodPathsSteps } from '../../../algorithms/categories/graph/good-paths-step-compiler';

describe('GoodPathsCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div', () => {
    const steps = buildGoodPathsSteps('classic_4node');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderGoodPathsCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点及点权文本存在
    expect(container.innerHTML).toContain('v:');
    expect(container.innerHTML).toContain('0');
    expect(container.innerHTML).toContain('1');
  });

  it('renders custom metrics with parent, count, vals and good paths compartment', () => {
    const steps = buildGoodPathsSteps('classic_4node');
    const midStep = steps.find((s) => s.status === 'pair') || steps[0];

    renderGoodPathsCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('parent[] (代表元)');
    expect(container.innerHTML).toContain('count[] (同大权频次)');
    expect(container.innerHTML).toContain('vals[] (节点点权)');
    expect(container.innerHTML).toContain('好路径实时收集舱');
  });
});
