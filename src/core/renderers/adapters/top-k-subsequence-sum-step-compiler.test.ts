// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTopKSubsequenceSumSteps,
  parseTopKInputs,
} from './top-k-subsequence-sum-step-compiler';
import {
  renderTopKBoard,
  renderTopKMetrics,
} from './top-k-subsequence-sum-canvas-adapter';

describe('TopKSubsequenceSum Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译非负数组前k个最小子序列和小根堆状态机步进', () => {
    const { nums, k } = parseTopKInputs({
      'input-nums': '1, 3, 6, 8',
      'input-k': 6,
    });
    expect(nums).toEqual([1, 3, 6, 8]);
    expect(k).toBe(6);

    const steps = buildTopKSubsequenceSumSteps(nums, k);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 前6个最小和 [0, 1, 3, 4, 6, 7]
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.ans).toEqual([0, 1, 3, 4, 6, 7]);
  });

  it('边界情况：空数组时返回 [0]', () => {
    const steps = buildTopKSubsequenceSumSteps([], 1);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.ans).toEqual([0]);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildTopKSubsequenceSumSteps([1, 3, 6, 8], 6);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderTopKBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderTopKMetrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
