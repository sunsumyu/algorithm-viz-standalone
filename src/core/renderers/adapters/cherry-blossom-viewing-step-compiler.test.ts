// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCherryBlossomViewingSteps,
  parseCherryDerivedItems,
} from './cherry-blossom-viewing-step-compiler';
import {
  renderCherryGardenCanvas,
  createCherryBlossomStages,
} from './cherry-blossom-viewing-canvas-adapter';

describe('CherryBlossomViewing Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('应该正确生成混合背包统一二进制拆分与 01 倒序推演步骤', () => {
    const inputs = {
      'input-t': '10',
      'input-costs': '2, 3, 5',
      'input-vals': '3, 4, 10',
      'input-cnts': '0, 2, 1',
    };
    const steps = buildCherryBlossomViewingSteps(inputs);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxVal).toBe(17);

    // 检查步骤行号存在且有效
    steps.forEach((s) => {
      expect(s.codeLine).toBeDefined();
      if (typeof s.codeLine === 'object' && s.codeLine !== null && 'java' in s.codeLine) {
        expect((s.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('应该支持解析衍生物品', () => {
    const parsed = parseCherryDerivedItems({
      'input-t': '10',
      'input-costs': '2, 3, 5',
      'input-vals': '3, 4, 10',
      'input-cnts': '0, 2, 1',
    });
    expect(parsed.t).toBe(10);
    expect(parsed.n).toBe(3);
    expect(parsed.derivedItems.length).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且阶段完整', () => {
    const steps = buildCherryBlossomViewingSteps({
      'input-t': '10',
      'input-costs': '2, 3, 5',
      'input-vals': '3, 4, 10',
      'input-cnts': '0, 2, 1',
    });
    renderCherryGardenCanvas(container, steps[0]);
    expect(container.innerHTML.length).toBeGreaterThan(50);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');

    const stages = createCherryBlossomStages();
    expect(stages.length).toBe(4);
  });
});
