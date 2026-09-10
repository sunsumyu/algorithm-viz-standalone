import { describe, it, expect } from 'vitest';
import { buildDiff1DSteps } from './diff-array-1d-renderer';
import { buildDiff2DSteps } from './diff-array-2d-renderer';
import { DIFF_1D_CODES, DIFF_2D_CODES } from './array-diff-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|处理)/);

  for (const step of steps) {
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, 'Step must have codeLine').toBeDefined();
    for (const [lang, line] of Object.entries(lineMap)) {
      const codeArray = codes[lang];
      expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }
}

describe('左神一维与二维差分专题三 (array-diff) 自动化测试套件', () => {
  it('1. 一维差分数组 (1D Difference Array)', () => {
    // bookings: [[1, 2, 10], [2, 3, 20], [2, 5, 25]], n = 5
    // index 1: 10
    // index 2: 10 + 20 + 25 = 55
    // index 3: 20 + 25 = 45
    // index 4: 25
    // index 5: 25
    const bookings = [
      [1, 2, 10],
      [2, 3, 20],
      [2, 5, 25],
    ];
    const steps = buildDiff1DSteps(bookings, 5);
    verifyLineMap(steps, DIFF_1D_CODES);
    const last = steps[steps.length - 1];
    expect(last.ansArray).toEqual([10, 55, 45, 25, 25]);
  });

  it('2. 二维差分与二维前缀和 (2D Difference Array)', () => {
    const ops = [
      [1, 1, 2, 2, 5],
      [2, 2, 3, 3, 3],
    ];
    const steps = buildDiff2DSteps(ops, 3, 3);
    verifyLineMap(steps, DIFF_2D_CODES);
    const last = steps[steps.length - 1];
    expect(last.ansMatrix![1][1]).toBe(5);
    expect(last.ansMatrix![2][2]).toBe(8); // 5 + 3 = 8
    expect(last.ansMatrix![3][3]).toBe(3);
  });
});
