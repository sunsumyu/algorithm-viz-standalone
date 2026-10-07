// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBuyingHayMinCostSteps,
  parseBuyingHayInputs,
} from './buying-hay-step-compiler';
import {
  renderBuyingHayArena,
  renderBuyingHayVectorMatrix,
  createBuyingHayStages,
} from './buying-hay-canvas-adapter';

describe('BuyingHay Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('应该正确生成完全背包允许超额求最小花费步骤', () => {
    const cost = [5, 100];
    const val = [10, 100];
    const h = 60;
    const steps = buildBuyingHayMinCostSteps(h, cost, val);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.minCost).toBe(30);

    // 检查步骤行号存在且有效
    steps.forEach((s) => {
      expect(s.codeLine).toBeDefined();
      if (typeof s.codeLine === 'object' && s.codeLine !== null && 'java' in s.codeLine) {
        expect((s.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('应该支持解析默认与自定义输入', () => {
    const parsed = parseBuyingHayInputs({
      'input-h': '15',
      'input-costs': '10, 12',
      'input-vals': '8, 16',
    });
    expect(parsed.h).toBe(15);
    expect(parsed.cost).toEqual([10, 12]);
    expect(parsed.val).toEqual([8, 16]);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且阶段完整', () => {
    const steps = buildBuyingHayMinCostSteps(60, [5, 100], [10, 100]);
    renderBuyingHayArena(container, steps[0]);
    expect(container.innerHTML.length).toBeGreaterThan(50);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');

    renderBuyingHayVectorMatrix(container, steps[steps.length - 1]);
    expect(container.innerHTML.length).toBeGreaterThan(50);

    const stages = createBuyingHayStages();
    expect(stages.length).toBe(4);
  });
});
