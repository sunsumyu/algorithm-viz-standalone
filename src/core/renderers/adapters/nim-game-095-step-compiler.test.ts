// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildNimGameSteps } from './nim-game-095-step-compiler';
import { nimGame095CanvasAdapter } from './nim-game-095-canvas-adapter';

describe('NimGame095 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('Bouton 定理推演：[3, 4, 5] 异或和为 2 != 0，先手必胜并给出决策', () => {
    const steps = buildNimGameSteps([3, 4, 5]);
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.isFirstWin).toBe(true);
    expect(last.xorSum).toBe(2);
    expect(last.bestMove).toBeDefined();
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('平衡态推演：[1, 2, 3] 异或和为 0，先手必败', () => {
    const steps = buildNimGameSteps([1, 2, 3]);
    const last = steps[steps.length - 1];
    expect(last.isFirstWin).toBe(false);
    expect(last.xorSum).toBe(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildNimGameSteps([3, 4, 5]);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      nimGame095CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
