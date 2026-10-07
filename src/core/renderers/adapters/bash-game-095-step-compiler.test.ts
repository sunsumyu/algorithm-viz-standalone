// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildBashGameSteps } from './bash-game-095-step-compiler';
import { bashGame095CanvasAdapter } from './bash-game-095-canvas-adapter';

describe('bash-game-095 step compiler & adapter', () => {
  it('应正确生成巴什博弈步骤且行号合法', () => {
    const steps = buildBashGameSteps(15, 3);
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
    const steps = buildBashGameSteps(16, 3);
    const container = document.createElement('div');
    bashGame095CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('博弈对称性策略剖析');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
