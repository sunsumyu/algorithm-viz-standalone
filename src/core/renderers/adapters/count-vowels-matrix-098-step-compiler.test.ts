// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildCountVowelsSteps } from './count-vowels-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('CountVowelsMatrix098 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('元音排列 n=5 答案应为 68', () => {
    const steps = buildCountVowelsSteps(5);
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.finalValue).toBe(68);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃', () => {
    const steps = buildCountVowelsSteps(5);
    for (const step of [steps[0], steps[steps.length - 1]]) {
      matrixPower098CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
