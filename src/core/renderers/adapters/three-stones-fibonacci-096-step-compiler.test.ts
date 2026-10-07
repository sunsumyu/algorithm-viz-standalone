// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildThreeStonesFibSteps } from './three-stones-fibonacci-096-step-compiler';
import { threeStonesFibonacci096CanvasAdapter } from './three-stones-fibonacci-096-canvas-adapter';

describe('ThreeStonesFib096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('三堆斐波那契 SG 推演：(5, 7, 9) 正常递推异或', () => {
    const steps = buildThreeStonesFibSteps(5, 7, 9);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.sgTable).toBeDefined();
    expect(last.isFirstWin).toBeDefined();
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildThreeStonesFibSteps(5, 7, 9);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      threeStonesFibonacci096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
