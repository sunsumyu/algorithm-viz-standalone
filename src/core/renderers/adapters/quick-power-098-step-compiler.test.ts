// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildQuickPowerSteps } from './quick-power-098-step-compiler';
import { quickPower098CanvasAdapter } from './quick-power-098-canvas-adapter';

describe('quick-power-098 StepCompiler & CanvasAdapter', () => {
  it('应当为给定底数和指数正确生成快速幂步骤并满足行号要求', () => {
    // 3^13 = 1594323
    const steps = buildQuickPowerSteps(3, 13);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBe(1594323);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildQuickPowerSteps(3, 13);
    quickPower098CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
