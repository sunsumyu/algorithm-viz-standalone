// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildBashSgSteps } from './bash-game-sg-096-step-compiler';
import { bashGameSg096CanvasAdapter } from './bash-game-sg-096-canvas-adapter';

describe('BashGameSg096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('巴什 SG 推演：n=12, m=3 时 SG(12)=0，先手必败', () => {
    const steps = buildBashSgSteps(12, 3);
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.sgTable![12]).toBe(0);
    expect(last.isFirstWin).toBe(false);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('巴什 SG 推演：n=10, m=3 时 SG(10)=2，先手必胜', () => {
    const steps = buildBashSgSteps(10, 3);
    const last = steps[steps.length - 1];
    expect(last.sgTable![10]).toBe(2);
    expect(last.isFirstWin).toBe(true);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildBashSgSteps(10, 3);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      bashGameSg096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
