// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBoundedKnapsackMonoQueueSteps,
  parseMonoQueueInputs,
} from './bounded-knapsack-monotonic-queue-step-compiler';
import {
  renderMonoQueueSandbox,
  renderMonoQueueVectorMatrix,
} from './bounded-knapsack-monotonic-queue-canvas-adapter';

describe('BoundedKnapsackMonotonicQueue Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并执行单调队列同余分组最值推演', () => {
    const parsed = parseMonoQueueInputs({
      'input-t': 15,
      'input-v': '3, 4, 7, 8',
      'input-w': '2, 3, 5, 6',
      'input-c': '2, 3, 2, 2',
    });
    expect(parsed.t).toBe(15);
    expect(parsed.vList).toEqual([3, 4, 7, 8]);

    const steps = buildBoundedKnapsackMonoQueueSteps({
      'input-t': 15,
      'input-v': '3, 4, 7, 8',
      'input-w': '2, 3, 5, 6',
      'input-c': '2, 3, 2, 2',
    });
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.maxVal).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildBoundedKnapsackMonoQueueSteps({
      'input-t': 15,
      'input-v': '3, 4, 7, 8',
      'input-w': '2, 3, 5, 6',
      'input-c': '2, 3, 2, 2',
    });
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderMonoQueueSandbox(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderMonoQueueVectorMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
