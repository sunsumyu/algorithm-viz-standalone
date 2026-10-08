import { describe, it, expect } from 'vitest';
import {
  buildWaterFlowSteps,
  createWaterFlowSteps,
  parseHeightsText,
  heightsToText,
  DEFAULT_HEIGHTS,
  PRESET_CASES,
} from './water-flow-step-compiler';

describe('water-flow-step-compiler', () => {
  it('should generate valid steps for DEFAULT_HEIGHTS', () => {
    const steps = buildWaterFlowSteps(DEFAULT_HEIGHTS);
    expect(steps.length).toBeGreaterThan(5);

    const firstStep = steps[0];
    expect(firstStep.action).toBe('init');
    expect(firstStep.stage).toBe('准备开始');
    expect(firstStep.rows).toBe(5);
    expect(firstStep.cols).toBe(5);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.action).toBe('done');
    expect(finalStep.bothCount).toBeGreaterThan(0);
    expect(finalStep.pacCount).toBeGreaterThan(0);
    expect(finalStep.atlCount).toBeGreaterThan(0);
  });

  it('should generate steps with metrics through createWaterFlowSteps', () => {
    const steps = createWaterFlowSteps();
    expect(steps.length).toBeGreaterThan(5);
    const last = steps[steps.length - 1];
    expect(last.metrics).toBeDefined();
    expect(last.metrics?.['metric-stage']).toBe('分析完成');
    expect(last.metrics?.['metric-both-count']).toBeDefined();
  });

  it('should correctly parse and serialize heights text', () => {
    const text = '1 2 3\n4 5 6';
    const parsed = parseHeightsText(text);
    expect(parsed).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    const formatted = heightsToText(parsed);
    expect(formatted).toBe('1 2 3\n4 5 6');

    // Fallback to default when empty
    expect(parseHeightsText('')).toEqual(DEFAULT_HEIGHTS);
  });

  it('should handle preset cases', () => {
    for (const key of Object.keys(PRESET_CASES)) {
      const p = PRESET_CASES[key];
      const steps = buildWaterFlowSteps(p.heights);
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[steps.length - 1].action).toBe('done');
    }
  });
});
