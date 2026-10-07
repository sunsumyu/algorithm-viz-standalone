// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildPrimePowerSteps } from './prime-power-stones-095-step-compiler';
import { primePowerStones095CanvasAdapter } from './prime-power-stones-095-canvas-adapter';

describe('prime-power-stones-095 step compiler & adapter', () => {
  it('应正确生成素数幂石子博弈步骤且行号合法', () => {
    const steps = buildPrimePowerSteps(14);
    expect(steps.length).toBeGreaterThan(3);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.isFirstWin).toBe(true);
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildPrimePowerSteps(18);
    const container = document.createElement('div');
    primePowerStones095CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('为什么素数幂模 6 绝不可能是 0');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
