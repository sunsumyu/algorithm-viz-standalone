import { describe, it, expect } from 'vitest';
import { buildBitTricksSteps } from './bit-tricks-renderer';
import { buildSingleNumberIISteps } from './single-number-ii-renderer';
import { buildSingleNumberIIISteps } from './single-number-iii-renderer';
import { buildBitsetArraySteps } from './bitset-array-renderer';
import {
  BIT_TRICKS_CODES,
  SINGLE_NUMBER_II_CODES,
  SINGLE_NUMBER_III_CODES,
  BITSET_ARRAY_CODES,
} from './bit-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|初始化)/);

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

describe('左神位运算神技与位图专题四 (bit-manipulation) 自动化测试套件', () => {
  it('1. 位运算核心神技 (Brian Kernighan & Bit Tricks)', () => {
    const steps = buildBitTricksSteps(40);
    verifyLineMap(steps, BIT_TRICKS_CODES);
    expect(steps.length).toBeGreaterThanOrEqual(4);
    // 40 = 0b101000, lowest 1 is 8 (0b1000)
    const extractStep = steps.find(s => s.decision.includes('神技一'));
    expect(extractStep).toBeDefined();
    expect(extractStep?.comparisonView?.resVal).toBe(8);

    // clear step: 40 & 39 = 32
    const clearStep = steps.find(s => s.decision.includes('神技二'));
    expect(clearStep).toBeDefined();
    expect(clearStep?.comparisonView?.resVal).toBe(32);

    // power of 2: 40 is not power of 2
    const powerStep = steps.find(s => s.decision.includes('神技三'));
    expect(powerStep).toBeDefined();
    expect(powerStep?.decision).toContain('不是 2 的幂');
  });

  it('2. 只出现一次的数字 II (Single Number II)', () => {
    const nums = [2, 2, 3, 2];
    const steps = buildSingleNumberIISteps(nums);
    verifyLineMap(steps, SINGLE_NUMBER_II_CODES);
    const last = steps[steps.length - 1];
    expect(last.stateView?.ones).toBe(3);
  });

  it('3. 只出现一次的数字 III (Single Number III)', () => {
    const nums = [1, 2, 1, 3, 2, 5];
    const steps = buildSingleNumberIIISteps(nums);
    verifyLineMap(steps, SINGLE_NUMBER_III_CODES);
    const last = steps[steps.length - 1];
    const ans = [last.groupView?.xorA, last.groupView?.xorB].sort();
    expect(ans).toEqual([3, 5]);
  });

  it('4. 位图结构设计与实现 (Bitset Array)', () => {
    const steps = buildBitsetArraySteps([5, 35, 68, 12], 35);
    verifyLineMap(steps, BITSET_ARRAY_CODES);
    const last = steps[steps.length - 1];
    expect(last.bitsetView?.result).toBe(true);

    // Test querying an uninserted number
    const stepsMissing = buildBitsetArraySteps([5, 35, 68, 12], 99);
    const lastMissing = stepsMissing[stepsMissing.length - 1];
    expect(lastMissing.bitsetView?.result).toBe(false);
  });
});
