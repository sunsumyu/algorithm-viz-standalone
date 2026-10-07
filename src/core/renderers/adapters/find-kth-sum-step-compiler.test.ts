// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildFindKthSumSteps,
  parseFindKthInputs,
} from './find-kth-sum-step-compiler';
import {
  renderFindKthBoard,
  renderFindKthMetrics,
} from './find-kth-sum-canvas-adapter';

describe('FindKthSum Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译 LeetCode 2386 找出数组的第K大和状态推演', () => {
    const { nums, k } = parseFindKthInputs({
      'input-nums': '2, 4, -2',
      'input-k': 5,
    });
    expect(nums).toEqual([2, 4, -2]);
    expect(k).toBe(5);

    const steps = buildFindKthSumSteps(nums, k);
    expect(steps.length).toBeGreaterThan(3);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 第 5 大和为 2
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.kthSum).toBe(2);
  });

  it('边界情况：单元素正数求第 1 大和', () => {
    const steps = buildFindKthSumSteps([5], 1);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.kthSum).toBe(5);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildFindKthSumSteps([2, 4, -2], 5);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderFindKthBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderFindKthMetrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
