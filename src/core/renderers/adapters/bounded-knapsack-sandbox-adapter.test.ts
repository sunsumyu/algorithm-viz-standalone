// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { BoundedKnapsackSandboxAdapter } from './bounded-knapsack-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('BoundedKnapsackSandboxAdapter 多重背包拟物沙盘测试', () => {
  it('应能正确解析朴素多重背包数据与件数限制', () => {
    const step: UniversalStep = {
      stage: 3,
      i: 1,
      j: 10,
    } as any;

    const data = BoundedKnapsackSandboxAdapter.parseData(step, {
      modelId: 'bounded-knapsack-naive',
    });

    expect(data.isBinary).toBe(false);
    expect(data.capacity).toBe(10);
    expect(data.items).toHaveLength(3);
    expect(data.items[0].weight).toBe(2);
    expect(data.items[0].value).toBe(3);
    expect(data.items[0].count).toBe(2);
  });

  it('应能为二进制拆分模式生成位权衍生包 (1, 2, 4...)', () => {
    const step: UniversalStep = {
      stage: 3,
      i: 0,
      j: 10,
    } as any;

    const data = BoundedKnapsackSandboxAdapter.parseData(step, {
      modelId: 'bounded-knapsack-binary',
    });

    expect(data.isBinary).toBe(true);
    expect(data.capacity).toBe(10);
    // 原 items: count=[2, 3, 2]
    // 宝物 1 (c=2): 拆为 1, 1 (2包)
    // 宝物 2 (c=3): 拆为 1, 2 (2包)
    // 宝物 3 (c=2): 拆为 1, 1 (2包)
    // 共 6 件衍生包
    expect(data.derivedPackages).toHaveLength(6);
    expect(data.derivedPackages[0].origId).toBe(1);
    expect(data.derivedPackages[0].multiplier).toBe(1);
    expect(data.derivedPackages[1].origId).toBe(1);
    expect(data.derivedPackages[1].multiplier).toBe(1);
    expect(data.derivedPackages[2].origId).toBe(2);
    expect(data.derivedPackages[2].multiplier).toBe(1);
    expect(data.derivedPackages[3].origId).toBe(2);
    expect(data.derivedPackages[3].multiplier).toBe(2);
  });

  it('应能正确渲染朴素多重背包沙盘 DOM', () => {
    const container = document.createElement('div');
    const step: UniversalStep = {
      stage: 3,
      i: 0,
      j: 10,
      msg: '多重背包转移：第 0 件物品选入 2 件',
    } as any;

    BoundedKnapsackSandboxAdapter.render(container, step, {
      modelId: 'bounded-knapsack-naive',
      currentStage: 'stage-3',
    });

    const html = container.innerHTML;
    expect(html).toContain('多重背包朴素枚举沙盘');
    expect(html).toContain('宝物库品类与件数限制货架');
    expect(html).toContain('背包载荷舱');
    expect(html).toContain('宝物 #1');
    expect(html).toContain('限 2 件');
  });

  it('应能正确渲染二进制拆分多重背包沙盘 DOM', () => {
    const container = document.createElement('div');
    const step: UniversalStep = {
      stage: 4,
      i: 1,
      j: 10,
      msg: '01 转化决策：选入当前衍生包',
    } as any;

    BoundedKnapsackSandboxAdapter.render(container, step, {
      modelId: 'bounded-knapsack-binary',
      currentStage: 'stage-4',
    });

    const html = container.innerHTML;
    expect(html).toContain('多重背包二进制拆分沙盘');
    expect(html).toContain('二进制拆分衍生 01 物品货架');
    expect(html).toContain('衍生包 #1');
    expect(html).toContain('源宝物 #1 × 1');
  });

  it('试验步 (trialK) 时沙盘回溯应准确扣除已试用重量，背包总重绝不超载', () => {
    const container = document.createElement('div');
    // 假设正在考察 item 1 (重 3, 试选 2 件 = 重 6), curJ = 7
    // 前面 item 0 (重 2, 价值 3) 剩余容量应为 7 - 6 = 1 (不足以装 item 0)
    const step: UniversalStep = {
      stage: 3,
      i: 1,
      j: 7,
      k: 2,
      grid: [
        [0, 0, 3, 3, 6, 6, 6, 6, 6, 6, 6],
        new Array(11).fill(null),
        new Array(11).fill(null),
      ],
      msg: '尝试选入 k=2 件',
    } as any;

    BoundedKnapsackSandboxAdapter.render(container, step, {
      modelId: 'multiple-knapsack',
      currentStage: 'stage-3',
    });

    const html = container.innerHTML;
    expect(html).toContain('正在尝试 ×2 件');
    // 载重使用率 6 / 4 (或 6/10) 不应出现 4 + 6 = 10 溢出
    expect(html).toContain('6 /');
  });
});
