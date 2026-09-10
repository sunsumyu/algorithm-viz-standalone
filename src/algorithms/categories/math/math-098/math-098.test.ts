import { describe, it, expect } from 'vitest';
import { buildQuickPowerSteps } from './quick-power-renderer';
import { buildFibMatrixSteps } from './fibonacci-matrix-renderer';
import { buildClimbingStairsSteps } from './climbing-stairs-matrix-renderer';
import { buildTribonacciSteps } from './tribonacci-matrix-renderer';
import { buildDominoSteps } from './domino-tromino-matrix-renderer';
import { buildCountVowelsSteps } from './count-vowels-matrix-renderer';
import { buildAttendanceSteps } from './attendance-record-matrix-renderer';
import {
  QUICK_POWER_CODES,
  FIBONACCI_MATRIX_CODES,
  CLIMBING_STAIRS_CODES,
  TRIBONACCI_MATRIX_CODES,
  DOMINO_TROMINO_CODES,
  COUNT_VOWELS_CODES,
  ATTENDANCE_RECORD_CODES,
} from './math-098-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|计算|准备|求解)/);

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

describe('左神快速幂与矩阵快速幂专题二 (math-098) 自动化测试套件', () => {
  it('1. 二进制快速幂 (Quick Power)', () => {
    // 3^13 = 1594323
    const steps = buildQuickPowerSteps(3, 13);
    verifyLineMap(steps, QUICK_POWER_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(1594323);
  });

  it('2. 斐波那契矩阵快速幂 (Fibonacci Matrix)', () => {
    // F(10) = 55
    const steps = buildFibMatrixSteps(10);
    verifyLineMap(steps, FIBONACCI_MATRIX_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(55);
  });

  it('3. 爬楼梯矩阵快速幂 (Climbing Stairs Matrix)', () => {
    // dp[4] = 5
    const steps = buildClimbingStairsSteps(4);
    verifyLineMap(steps, CLIMBING_STAIRS_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(5);
  });

  it('4. 泰波那契数矩阵快速幂 (Tribonacci Matrix)', () => {
    // T(4) = 4
    const steps = buildTribonacciSteps(4);
    verifyLineMap(steps, TRIBONACCI_MATRIX_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(4);
  });

  it('5. 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino)', () => {
    // n=4 -> 11
    const steps = buildDominoSteps(4);
    verifyLineMap(steps, DOMINO_TROMINO_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(11);
  });

  it('6. 元音排列矩阵快速幂 (Count Vowels)', () => {
    // n=5 -> 68
    const steps = buildCountVowelsSteps(5);
    verifyLineMap(steps, COUNT_VOWELS_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(68);
  });

  it('7. 出勤记录 II 矩阵快速幂 (Attendance Record II)', () => {
    // n=2 -> 8
    const steps = buildAttendanceSteps(2);
    verifyLineMap(steps, ATTENDANCE_RECORD_CODES);
    expect(steps[steps.length - 1].finalValue).toBe(8);
  });
});
