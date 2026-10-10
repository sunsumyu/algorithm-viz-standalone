/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderStringMigrationCanvas,
  renderStringMigrationCustomMetrics,
} from './string-migration-canvas-adapter';
import { buildStringMigrationSteps } from '../../../algorithms/categories/graph/string-migration-step-compiler';

describe('StringMigrationCanvasAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders pure SVG canvas without wrapping div in Card 1', () => {
    const steps = buildStringMigrationSteps('abcde', 'cdeab');
    expect(steps.length).toBeGreaterThan(0);

    const step = steps[steps.length - 1];
    renderStringMigrationCanvas(container, step);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');

    // 检查字符渲染
    expect(container.innerHTML).toContain('goal:');
    expect(container.innerHTML).toContain('s + s:');
  });

  it('renders custom metrics with shift and double-concat theorem compartment', () => {
    const steps = buildStringMigrationSteps('abcde', 'cdeab');
    const step = steps[steps.length - 1];

    renderStringMigrationCustomMetrics(container, step);

    expect(container.innerHTML).toContain('左旋偏移量 (shift)');
    expect(container.innerHTML).toContain('当前窗口子串');
    expect(container.innerHTML).toContain('双倍拼接 (s + s) 定理验证');
  });
});
