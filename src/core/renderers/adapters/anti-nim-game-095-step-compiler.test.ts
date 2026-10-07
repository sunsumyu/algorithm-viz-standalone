// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildAntiNimSteps } from './anti-nim-game-095-step-compiler';
import { antiNimGame095CanvasAdapter } from './anti-nim-game-095-canvas-adapter';

describe('AntiNim095 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('SJ定理分支一：纯单堆 [1, 1, 1, 1] 堆数为偶数，先手必胜', () => {
    const steps = buildAntiNimSteps([1, 1, 1, 1]);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.isAllOneOrZero).toBe(true);
    expect(last.isFirstWin).toBe(true);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('SJ定理分支二：多石子堆 [3, 5, 7] 异或和非0，先手必胜', () => {
    const steps = buildAntiNimSteps([3, 5, 7]);
    const last = steps[steps.length - 1];
    expect(last.isAllOneOrZero).toBe(false);
    expect(last.isFirstWin).toBe(true);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildAntiNimSteps([1, 1, 1, 1]);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      antiNimGame095CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
