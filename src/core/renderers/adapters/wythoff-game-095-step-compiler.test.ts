// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildWythoffSteps } from './wythoff-game-095-step-compiler';
import { wythoffGame095CanvasAdapter } from './wythoff-game-095-canvas-adapter';

describe('wythoff-game-095 step compiler & adapter', () => {
  it('应正确生成威佐夫博弈步骤且行号合法', () => {
    // (3, 5) 为奇异局势 -> 先手必败
    const stepsCold = buildWythoffSteps(3, 5);
    expect(stepsCold.length).toBeGreaterThan(3);

    for (const step of stepsCold) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStepCold = stepsCold[stepsCold.length - 1]!;
    expect(lastStepCold.isFirstWin).toBe(false);

    // (4, 8) 非奇异局势 -> 先手必胜
    const stepsWin = buildWythoffSteps(4, 8);
    const lastStepWin = stepsWin[stepsWin.length - 1]!;
    expect(lastStepWin.isFirstWin).toBe(true);
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildWythoffSteps(3, 5);
    const container = document.createElement('div');
    wythoffGame095CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('威佐夫奇异局势序列');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
