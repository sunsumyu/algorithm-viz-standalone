// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSplitGameSteps } from './split-game-096-step-compiler';
import { splitGame096CanvasAdapter } from './split-game-096-canvas-adapter';

describe('SplitGame096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('分裂石子推演：SG(1)=0, SG 准确递推', () => {
    const steps = buildSplitGameSteps(6);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.sgTable![1]).toBe(0);
    expect(last.isFirstWin).toBeDefined();
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildSplitGameSteps(6);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      splitGame096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
