// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildDominoSteps } from './domino-tromino-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('DominoTrominoMatrix098 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('多米诺平铺 n=4 答案应为 11', () => {
    const steps = buildDominoSteps(4);
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.finalValue).toBe(11);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildDominoSteps(4);
    for (const step of [steps[0], steps[steps.length - 1]]) {
      matrixPower098CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
