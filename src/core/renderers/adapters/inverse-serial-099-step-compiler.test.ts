// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildInverseSerialSteps } from './inverse-serial-099-step-compiler';
import { inverseSerial099CanvasAdapter } from './inverse-serial-099-canvas-adapter';

describe('inverse-serial-099 StepCompiler & CanvasAdapter', () => {
  it('应当为给定上限正确生成线性递推逆元步骤并满足行号要求', () => {
    const steps = buildInverseSerialSteps(5, 1000000007);
    expect(steps.length).toBeGreaterThan(0);
    const table = steps[steps.length - 1].inversesTable!;
    expect(table[0].inv).toBe(1);
    expect(table[2].inv).toBe(333333336);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildInverseSerialSteps(5, 1000000007);
    inverseSerial099CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
