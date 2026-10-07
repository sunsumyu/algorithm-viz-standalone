// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTargetSumSteps,
  parseTargetSumInputs,
} from './target-sum-step-compiler';
import {
  renderTargetSumBoard,
  renderTargetSumStage1Canvas,
  renderTargetSumStage1Metrics,
  renderTargetSumStage4Metrics,
} from './target-sum-canvas-adapter';

describe('TargetSum Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译标准案例 nums=[1,1,1,1,1], target=3 的 01 背包方案计数步进', () => {
    const { nums, target } = parseTargetSumInputs({
      'input-nums': '1, 1, 1, 1, 1',
      'input-target': 3,
    });
    expect(nums).toEqual([1, 1, 1, 1, 1]);
    expect(target).toBe(3);

    const steps = buildTargetSumSteps(nums, target);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.ways).toBe(5);
    expect(last.dp[4]).toBe(5);
  });

  it('对于奇偶性失配或越界情况正确处理无解返回 0 方案', () => {
    const steps = buildTargetSumSteps([1], 2);
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.ways).toBe(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildTargetSumSteps([1, 1, 1, 1, 1], 3);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderTargetSumBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderTargetSumStage4Metrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }

    renderTargetSumStage1Canvas(container, {
      i: 0,
      n: 5,
      nums: [1, 1, 1, 1, 1],
      decision: '+1',
      message: '测试',
      callStack: [{ name: 'f', args: 'i=0, sum=0' }],
    });
    expect(container.innerHTML).not.toContain('[object Object]');

    renderTargetSumStage1Metrics(container, {
      callStack: [{ name: 'f' }],
      remCap: 4,
    });
    expect(container.innerHTML).not.toContain('[object Object]');
  });
});
