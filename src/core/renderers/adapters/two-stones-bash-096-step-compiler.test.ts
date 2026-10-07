// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildTwoStonesBashSteps } from './two-stones-bash-096-step-compiler';
import { twoStonesBash096CanvasAdapter } from './two-stones-bash-096-canvas-adapter';

describe('TwoStonesBash096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('双堆巴什推演：(7, 5, m=3) 7%4=3, 5%4=1, 3^1=2!=0 先手胜', () => {
    const steps = buildTwoStonesBashSteps(7, 5, 3);
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.sg1).toBe(3);
    expect(last.sg2).toBe(1);
    expect(last.xorSum).toBe(2);
    expect(last.isFirstWin).toBe(true);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('双堆巴什推演：(7, 3, m=3) 3^3=0 先手败', () => {
    const steps = buildTwoStonesBashSteps(7, 3, 3);
    const last = steps[steps.length - 1];
    expect(last.xorSum).toBe(0);
    expect(last.isFirstWin).toBe(false);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildTwoStonesBashSteps(7, 5, 3);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      twoStonesBash096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
