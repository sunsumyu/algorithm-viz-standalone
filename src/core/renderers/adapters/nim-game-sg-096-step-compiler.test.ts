// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildNimSgSteps } from './nim-game-sg-096-step-compiler';
import { nimGameSg096CanvasAdapter } from './nim-game-sg-096-canvas-adapter';

describe('NimGameSg096 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('尼姆 SG 推演：SG(x) = x 恒成立', () => {
    const steps = buildNimSgSteps(5);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.sgTable).toEqual([0, 1, 2, 3, 4, 5]);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildNimSgSteps(5);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      nimGameSg096CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
