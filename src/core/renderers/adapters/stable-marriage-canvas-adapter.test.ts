/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderStableMarriageCanvas,
  renderStableMarriageCustomMetrics,
} from './stable-marriage-canvas-adapter';
import { buildStableMarriageSteps } from '../../../algorithms/categories/graph/stable-marriage-step-compiler';

describe('StableMarriageCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div', () => {
    const steps = buildStableMarriageSteps('classic_3pair');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderStableMarriageCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查男女节点及订婚文字存在
    expect(container.innerHTML).toContain('M1');
    expect(container.innerHTML).toContain('W1');
    expect(container.innerHTML).toContain('💍');
  });

  it('renders custom metrics with husband, wife and nextPropose array monitors', () => {
    const steps = buildStableMarriageSteps('classic_3pair');
    const midStep = steps.find((s) => s.status === 'accept') || steps[0];

    renderStableMarriageCustomMetrics(container, midStep);

    expect(container.innerHTML).toContain('husband[] (未婚夫)');
    expect(container.innerHTML).toContain('wife[] (未婚妻)');
    expect(container.innerHTML).toContain('nextPropose[] (顺位)');
    expect(container.innerHTML).toContain('当前已缔结婚约数');
  });
});
