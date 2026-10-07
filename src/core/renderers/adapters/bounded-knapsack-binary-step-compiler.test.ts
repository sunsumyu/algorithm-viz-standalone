// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBoundedKnapsackBinarySteps,
  parseBinarySplitInputs,
} from './bounded-knapsack-binary-step-compiler';
import {
  renderBinarySplitSandbox,
  renderBinarySplitVectorMatrix,
} from './bounded-knapsack-binary-canvas-adapter';

describe('BoundedKnapsackBinary Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并执行二进制拆分与 01 背包求解', () => {
    const parsed = parseBinarySplitInputs({
      'input-t': 10,
      'input-v': '3, 4, 7',
      'input-w': '2, 3, 5',
      'input-c': '2, 3, 2',
    });
    expect(parsed.t).toBe(10);
    // 宝物1 (c=2) 拆为 1, 1; 宝物2 (c=3) 拆为 1, 2; 宝物3 (c=2) 拆为 1, 1 => 共 6 个衍生包
    expect(parsed.derivedItems.length).toBe(6);

    const steps = buildBoundedKnapsackBinarySteps({
      'input-t': 10,
      'input-v': '3, 4, 7',
      'input-w': '2, 3, 5',
      'input-c': '2, 3, 2',
    });
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('split');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 最大收益 14
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.maxVal).toBe(14);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildBoundedKnapsackBinarySteps({
      'input-t': 10,
      'input-v': '3, 4, 7',
      'input-w': '2, 3, 5',
      'input-c': '2, 3, 2',
    });
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderBinarySplitSandbox(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderBinarySplitVectorMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
