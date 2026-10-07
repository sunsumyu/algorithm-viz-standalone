// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildDigitDp079Steps } from './digit-dp-basic-079-step-compiler';
import { renderDigitDpCanvas } from './digit-dp-basic-079-canvas-adapter';

describe('DigitDpBasic079 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('能正确计算 1 到 13 中数字 1 出现次数为 6', () => {
    const steps = buildDigitDp079Steps(13);
    expect(steps.length).toBeGreaterThan(5);

    const s0 = steps[0];
    expect(s0.digits).toEqual([1, 3]);
    expect(s0.codeLine).toBeDefined();

    const last = steps[steps.length - 1];
    expect(last.cnt1).toBe(6);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = buildDigitDp079Steps(13);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderDigitDpCanvas(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
