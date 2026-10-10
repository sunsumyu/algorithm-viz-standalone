/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderCycleCountingCanvas,
  renderCycleCountingCustomMetrics,
} from './cycle-counting-canvas-adapter';
import { buildCycleCountingSteps } from '../../../algorithms/categories/graph/cycle-counting-step-compiler';

describe('CycleCountingCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div', () => {
    const steps = buildCycleCountingSteps('classic_diamond_triangles');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderCycleCountingCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查节点与度数文本存在
    expect(container.innerHTML).toContain('deg:');
    expect(container.innerHTML).toContain('1');
    expect(container.innerHTML).toContain('2');
  });

  it('renders custom metrics with deg, vis, cnt array monitors and 3-cycles', () => {
    const steps = buildCycleCountingSteps('classic_diamond_triangles');
    const midStep = steps.find((s) => s.status === 'search3') || steps[0];

    renderCycleCountingCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('deg[] (节点度数)');
    expect(container.innerHTML).toContain('vis[] (出邻打标)');
    expect(container.innerHTML).toContain('cnt[] (中继计数)');
    expect(container.innerHTML).toContain('已发现三元环');
  });
});
