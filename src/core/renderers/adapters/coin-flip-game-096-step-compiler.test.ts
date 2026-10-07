// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildCoinFlipSteps } from './coin-flip-game-096-step-compiler';
import { coinFlipGame096CanvasAdapter } from './coin-flip-game-096-canvas-adapter';

describe('CoinFlipGame096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('翻硬币推演：[1, 0, 1] 正面在 #1 和 #3，SG = 1^3 = 2 != 0 先手胜', () => {
    const steps = buildCoinFlipSteps([1, 0, 1]);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.xorSum).toBe(2);
    expect(last.isFirstWin).toBe(true);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('翻硬币推演：[0, 0, 0] 全反面 SG = 0 先手负', () => {
    const steps = buildCoinFlipSteps([0, 0, 0]);
    const last = steps[steps.length - 1];
    expect(last.xorSum).toBe(0);
    expect(last.isFirstWin).toBe(false);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildCoinFlipSteps([1, 0, 1]);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      coinFlipGame096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
