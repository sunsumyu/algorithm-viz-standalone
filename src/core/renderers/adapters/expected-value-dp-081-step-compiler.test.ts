// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildExpectedValue081Steps } from './expected-value-dp-081-step-compiler';
import { renderExpectedValueDpCanvas } from './expected-value-dp-081-canvas-adapter';

describe('ExpectedValueDp081 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('棋盘走日等权全概率扩散，求出 2 步后留在棋盘概率为 0.0625', () => {
    const steps = buildExpectedValue081Steps();
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.totalProb).toBe(0.0625);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = buildExpectedValue081Steps();
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderExpectedValueDpCanvas(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
