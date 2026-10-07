// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildCoinBuySteps } from './coin-buy-ways-099-step-compiler';
import { coinBuyWays099CanvasAdapter } from './coin-buy-ways-099-canvas-adapter';

describe('coin-buy-ways-099 StepCompiler & CanvasAdapter', () => {
  it('应当为给定面额与限制正确生成硬币购物容斥步骤并满足行号要求', () => {
    const c = [1, 2, 5, 10];
    const d = [3, 2, 3, 1];
    const s = 10;
    const steps = buildCoinBuySteps(c, d, s);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBeGreaterThan(0);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildCoinBuySteps([1, 2, 5, 10], [3, 2, 3, 1], 10);
    coinBuyWays099CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
