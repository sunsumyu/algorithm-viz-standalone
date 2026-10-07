// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildSosDp086Steps } from './sos-profile-dp-086-step-compiler';
import { sosDp086CanvasAdapter } from './sos-profile-dp-086-canvas-adapter';

describe('sos-profile-dp-086 step compiler & adapter', () => {
  it('应正确生成 SOS DP 步骤且行号合法', () => {
    const steps = buildSosDp086Steps({ a: [1, 2, 4, 8], n: 2 });
    expect(steps.length).toBeGreaterThan(4);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.dp[3]).toBe(1 + 2 + 4 + 8); // 全集掩码和
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildSosDp086Steps([1, 1, 1, 1]);
    const container = document.createElement('div');
    sosDp086CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('SOS DP 超立方体高维前缀和');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
