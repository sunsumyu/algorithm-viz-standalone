// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildMaxPointsSteps,
  parseMaxPointsInputs,
  MAX_POINTS_CODES,
  MAX_POINTS_CODE_LINES,
} from './max-points-on-a-line-step-compiler';
import { renderMaxPointsCanvas } from './max-points-on-a-line-canvas-adapter';

describe('max-points-on-a-line step compiler & canvas adapter', () => {
  it('handles small input <= 2 points properly', () => {
    const points = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
    const steps = buildMaxPointsSteps(points);
    expect(steps.length).toBe(1);
    expect(steps[0].phase).toBe('finish');
    expect(steps[0].globalMax).toBe(2);
    expect(steps[0].line).toBe(MAX_POINTS_CODE_LINES.shortInput.javascript);
  });

  it('calculates collinear points correctly for 3 collinear points', () => {
    const points = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    const steps = buildMaxPointsSteps(points);
    expect(steps.length).toBeGreaterThan(3);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('finish');
    expect(lastStep.globalMax).toBe(3);
    expect(lastStep.line).toBe(MAX_POINTS_CODE_LINES.finish.javascript);
  });

  it('parses custom coordinate inputs correctly', () => {
    const parsed = parseMaxPointsInputs('1,1; 2,2; 3,3');
    expect(parsed).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);

    const fallback = parseMaxPointsInputs('invalid');
    expect(fallback.length).toBe(6);
  });

  it('renders canvas HTML successfully without throwing', () => {
    const steps = buildMaxPointsSteps([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);
    const html = renderMaxPointsCanvas(steps[1]);
    expect(html).toContain('几何散点平面');
    expect(html).toContain('斜率哈希桶');
  });

  it('validates 4-language code definitions and line mappings', () => {
    expect(MAX_POINTS_CODES.java).toBeDefined();
    expect(MAX_POINTS_CODES.cpp).toBeDefined();
    expect(MAX_POINTS_CODES.python).toBeDefined();
    expect(MAX_POINTS_CODES.javascript).toBeDefined();
  });
});
