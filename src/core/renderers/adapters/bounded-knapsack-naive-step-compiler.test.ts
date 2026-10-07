// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBoundedKnapsackNaiveSteps,
  parseNaiveInputs,
} from './bounded-knapsack-naive-step-compiler';
import {
  renderBoundedNaiveSandbox,
  renderBoundedNaiveVectorMatrix,
} from './bounded-knapsack-naive-canvas-adapter';

describe('BoundedKnapsackNaive Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译洛谷 P1776 宝物筛选小用例', () => {
    const parsed = parseNaiveInputs({
      'input-t': 10,
      'input-v': '3, 4, 7',
      'input-w': '2, 3, 5',
      'input-c': '2, 3, 2',
    });
    expect(parsed.t).toBe(10);
    expect(parsed.vList).toEqual([3, 4, 7]);
    expect(parsed.wList).toEqual([2, 3, 5]);
    expect(parsed.cList).toEqual([2, 3, 2]);

    const steps = buildBoundedKnapsackNaiveSteps(parsed);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 最大收益 14
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.maxVal).toBe(14);
  });

  it('容量为 0 时，最大价值应为 0', () => {
    const steps = buildBoundedKnapsackNaiveSteps({
      'input-t': 0,
      'input-v': '10, 20',
      'input-w': '5, 10',
      'input-c': '2, 2',
    });
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.maxVal).toBe(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildBoundedKnapsackNaiveSteps({
      'input-t': 10,
      'input-v': '3, 4, 7',
      'input-w': '2, 3, 5',
      'input-c': '2, 3, 2',
    });
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderBoundedNaiveSandbox(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderBoundedNaiveVectorMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
