// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildGameDp085Steps } from './game-probability-dp-085-step-compiler';
import { gameProbabilityDp085CanvasAdapter } from './game-probability-dp-085-canvas-adapter';

describe('game-probability-dp-085 step compiler & adapter', () => {
  it('应正确生成博弈 DP 步骤且行号合法', () => {
    const steps = buildGameDp085Steps({ nums: [1, 5, 2] });
    expect(steps.length).toBeGreaterThan(4);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.bestDiff).toBeDefined();
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildGameDp085Steps([1, 5, 233, 7]);
    const container = document.createElement('div');
    gameProbabilityDp085CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('极大极小石子博弈');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
