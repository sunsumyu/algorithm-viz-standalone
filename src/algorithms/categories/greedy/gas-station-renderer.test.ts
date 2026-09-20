import { describe, expect, it } from 'vitest';
import { GAS_STATION_CODE_LANGUAGES } from './gas-station-problem-content';
import { buildGasStationSteps } from './gas-station-renderer';

describe('Gas Station 标准声明式步骤契约', () => {
  it('包含入口、核心扫描、收敛结果三类教学帧', () => {
    const steps = buildGasStationSteps([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
    expect(steps.length).toBeGreaterThan(2);
    expect(steps[0].action).toBe('init');
    expect(steps.some((step) => step.action === 'scan')).toBe(true);
    expect(steps[steps.length - 1].action).toBe('success');
    expect(steps[steps.length - 1].startStation).toBe(3);
  });

  it('每一帧都提供标准 StepBase 文本与四语言合法高亮', () => {
    const steps = buildGasStationSteps([2, 3, 4], [3, 4, 3]);
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.decision).toBeTruthy();
      for (const [language, target] of Object.entries(step.codeLine)) {
        const primary = typeof target === 'number' ? target : target.primary;
        expect(primary).toBeGreaterThanOrEqual(1);
        expect(primary).toBeLessThanOrEqual(GAS_STATION_CODE_LANGUAGES[language].length);
      }
    }
    expect(steps[steps.length - 1].action).toBe('failed');
    expect(steps[steps.length - 1].startStation).toBe(-1);
  });
});
