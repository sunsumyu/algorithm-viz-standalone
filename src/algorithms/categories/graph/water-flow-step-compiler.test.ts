import { describe, it, expect } from 'vitest';
import {
  buildWaterFlowSteps,
  createWaterFlowSteps,
  parseHeightsText,
  heightsToText,
  formatHeightsInput,
  createWaterFlowStageSteps,
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

    // Verify codeLine dynamically covers core DFS and intersection lines without freezing
    const codeLines = new Set(steps.map((s) => JSON.stringify(s.codeLine)));
    expect(codeLines.size).toBeGreaterThanOrEqual(4);
    expect(steps.some((s) => s.action === 'pacific' && s.codeLine === 26)).toBe(true);
    expect(steps.some((s) => s.action === 'intersect' && s.codeLine === 19)).toBe(true);
    expect(steps.some((s) => s.action === 'done' && s.codeLine === 22)).toBe(true);
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

    // Semicolon format
    const semiFormatted = formatHeightsInput(parsed);
    expect(semiFormatted).toBe('1 2 3; 4 5 6');
    expect(parseHeightsText(semiFormatted)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    // Robustness: single-line flat sequence auto-recovery
    const flat25 = '1 2 2 3 5 3 2 3 4 4 2 4 5 3 1 6 7 1 4 5 5 1 1 2 4';
    const recovered = parseHeightsText(flat25);
    expect(recovered.length).toBe(5);
    expect(recovered[0].length).toBe(5);

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

  it('should generate valid steps for all 3 evolution stages', () => {
    const s1Steps = createWaterFlowStageSteps('stage-1', DEFAULT_HEIGHTS);
    expect(s1Steps.length).toBeGreaterThan(10);
    expect(s1Steps[0].stage).toContain('正向顺流暴力');
    expect(s1Steps[s1Steps.length - 1].action).toBe('done');
    expect(s1Steps[s1Steps.length - 1].bothCount).toBeGreaterThan(0);

    const s2Steps = createWaterFlowStageSteps('stage-2', DEFAULT_HEIGHTS);
    expect(s2Steps.length).toBeGreaterThan(10);
    expect(s2Steps[s2Steps.length - 1].action).toBe('done');

    const s3Steps = createWaterFlowStageSteps('stage-3', DEFAULT_HEIGHTS);
    expect(s3Steps.length).toBeGreaterThan(10);
    expect(s3Steps[0].statusText).toContain('逆向多源 BFS');
    expect(s3Steps[s3Steps.length - 1].action).toBe('done');
    expect(s3Steps[s3Steps.length - 1].bothCount).toBe(s2Steps[s2Steps.length - 1].bothCount);
  });
});
