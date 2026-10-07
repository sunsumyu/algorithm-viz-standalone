// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCoinsFromPilesSteps,
  parseCoinsFromPilesInputs,
} from './coins-from-piles-step-compiler';
import {
  renderCoinsFromPilesSandbox,
  renderCoinsFromPilesVectorMatrix,
  createCoinsFromPilesStages,
} from './coins-from-piles-canvas-adapter';

describe('CoinsFromPiles Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('应该正确生成前缀和转分组背包的推演步骤与合法行号', () => {
    const piles = [
      [1, 100, 3],
      [7, 8, 9],
    ];
    const k = 2;
    const steps = buildCoinsFromPilesSteps(piles, k);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.maxVal).toBe(101);

    // 检查步骤行号存在且有效
    steps.forEach((s) => {
      expect(s.codeLine).toBeDefined();
      if (typeof s.codeLine === 'object' && s.codeLine !== null && 'java' in s.codeLine) {
        expect((s.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('应该支持解析默认与自定义输入', () => {
    const parsed = parseCoinsFromPilesInputs({
      'input-k': '4',
      'input-piles-json': '[[10,20],[1,1,100],[50]]',
    });
    expect(parsed.k).toBe(4);
    expect(parsed.piles.length).toBe(3);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且阶段完整', () => {
    const piles = [
      [1, 100, 3],
      [7, 8, 9],
    ];
    const steps = buildCoinsFromPilesSteps(piles, 2);
    renderCoinsFromPilesSandbox(container, steps[0]);
    expect(container.innerHTML.length).toBeGreaterThan(50);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');

    renderCoinsFromPilesVectorMatrix(container, steps[steps.length - 1]);
    expect(container.innerHTML.length).toBeGreaterThan(50);

    const stages = createCoinsFromPilesStages();
    expect(stages.length).toBe(4);
  });
});
