// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildUnboundedKnapsackSteps,
  parseUnboundedKnapsackInputs,
} from './unbounded-knapsack-step-compiler';
import {
  renderUnboundedKnapsackCanvas,
  renderUnboundedKnapsackMetrics,
  createUnboundedKnapsackStages,
} from './unbounded-knapsack-canvas-adapter';

describe('UnboundedKnapsack Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('应该正确生成完全背包推演步骤与合法行号', () => {
    const cost = [71, 23];
    const val = [100, 10];
    const t = 70;
    const steps = buildUnboundedKnapsackSteps(t, cost, val);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxVal).toBe(30);

    // 检查步骤行号存在且有效
    steps.forEach((s) => {
      expect(s.codeLine).toBeDefined();
      if (typeof s.codeLine === 'object' && s.codeLine !== null && 'java' in s.codeLine) {
        expect((s.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('应该支持解析默认与自定义输入', () => {
    const parsed = parseUnboundedKnapsackInputs({
      'input-t': '10',
      'input-costs': '2, 3, 5',
      'input-vals': '5, 8, 14',
    });
    expect(parsed.t).toBe(10);
    expect(parsed.cost).toEqual([2, 3, 5]);
    expect(parsed.val).toEqual([5, 8, 14]);
    expect(parsed.items.length).toBe(3);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且阶段完整', () => {
    const steps = buildUnboundedKnapsackSteps(70, [71, 23], [100, 10]);
    renderUnboundedKnapsackCanvas(container, steps[0]);
    expect(container.innerHTML.length).toBeGreaterThan(50);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');

    renderUnboundedKnapsackMetrics(container, steps[steps.length - 1]);
    expect(container.innerHTML.length).toBeGreaterThan(50);

    const stages = createUnboundedKnapsackStages();
    expect(stages.length).toBe(4);
  });
});
