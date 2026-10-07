// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildFibonacciSteps } from './fibonacci-game-095-step-compiler';
import { fibonacciGame095CanvasAdapter } from './fibonacci-game-095-canvas-adapter';

describe('fibonacci-game-095 step compiler & adapter', () => {
  it('应正确生成斐波那契博弈步骤且行号合法', () => {
    const steps = buildFibonacciSteps(13);
    expect(steps.length).toBeGreaterThan(3);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.isFirstWin).toBe(false); // 13 为斐波那契数，先手必败
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildFibonacciSteps(16);
    const container = document.createElement('div');
    fibonacciGame095CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('齐肯多夫定理');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
