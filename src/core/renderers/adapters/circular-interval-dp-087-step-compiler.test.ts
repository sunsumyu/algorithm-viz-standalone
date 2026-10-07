// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildCircularInterval087Steps } from './circular-interval-dp-087-step-compiler';
import { circularIntervalDp087CanvasAdapter } from './circular-interval-dp-087-canvas-adapter';

describe('CircularInterval087 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('破环成链倍长正确推演并在默认珠子序列下得到最大能量 710', () => {
    const steps = buildCircularInterval087Steps([2, 3, 5, 10]);
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.maxEnergy).toBe(710);
    expect(last.codeLine).toBeDefined();
    expect(last.line).toBeGreaterThan(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = buildCircularInterval087Steps();
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      circularIntervalDp087CanvasAdapter.render(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
