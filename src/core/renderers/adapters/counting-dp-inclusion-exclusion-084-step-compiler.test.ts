// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildCounting084Steps } from './counting-dp-inclusion-exclusion-084-step-compiler';
import { countingDp084CanvasAdapter } from './counting-dp-inclusion-exclusion-084-canvas-adapter';

describe('counting-dp-inclusion-exclusion-084 step compiler & adapter', () => {
  it('应正确生成错排递推步骤且行号合法', () => {
    const steps = buildCounting084Steps({ n: 4 });
    expect(steps.length).toBeGreaterThan(3);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.curAns).toBe(9); // D(4) = 9
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildCounting084Steps(3);
    const container = document.createElement('div');
    countingDp084CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('错排递推状态演化');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
