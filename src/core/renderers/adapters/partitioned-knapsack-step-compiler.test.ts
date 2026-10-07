// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildPartitionedKnapsackSteps,
  parsePartitionedInputs,
} from './partitioned-knapsack-step-compiler';
import {
  renderPartitionedKnapsackCanvas,
  renderPartitionedKnapsackMetrics,
  createPartitionedKnapsackStages,
} from './partitioned-knapsack-canvas-adapter';

describe('PartitionedKnapsack Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('应该正确生成分组背包推演步骤与合法行号', () => {
    const parsed = parsePartitionedInputs({
      'input-capacity': '45',
      'input-items-json': '[[10,10,1],[10,20,1],[20,20,2]]',
    });
    const steps = buildPartitionedKnapsackSteps(parsed.m, parsed.items);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxVal).toBe(40);

    // 检查步骤行号存在且有效
    steps.forEach((s) => {
      expect(s.codeLine).toBeDefined();
      if (typeof s.codeLine === 'object' && s.codeLine !== null && 'java' in s.codeLine) {
        expect((s.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('应该支持解析默认与自定义输入', () => {
    const parsed = parsePartitionedInputs({
      'input-capacity': '50',
      'input-items-json': '[[15,25,1],[10,15,1],[20,30,2]]',
    });
    expect(parsed.m).toBe(50);
    expect(parsed.items.length).toBe(3);
    expect(parsed.items[0].group).toBe(1);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且阶段完整', () => {
    const parsed = parsePartitionedInputs({});
    const steps = buildPartitionedKnapsackSteps(parsed.m, parsed.items);
    renderPartitionedKnapsackCanvas(container, steps[0]);
    expect(container.innerHTML.length).toBeGreaterThan(50);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');

    renderPartitionedKnapsackMetrics(container, steps[steps.length - 1]);
    expect(container.innerHTML.length).toBeGreaterThan(50);

    const stages = createPartitionedKnapsackStages();
    expect(stages.length).toBe(4);
  });
});
