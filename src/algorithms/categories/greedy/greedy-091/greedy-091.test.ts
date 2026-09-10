import { describe, it, expect } from 'vitest';
import { buildShortestUnsortedSteps } from './shortest-unsorted-subarray-renderer';
import { buildSmallestRangeSteps } from './smallest-range-renderer';
import { buildGroupBuyTicketsSteps } from './group-buy-tickets-renderer';
import { buildSplitMinAvgSumSteps } from './split-min-avg-sum-renderer';
import { buildMinimalBatteryPowerSteps } from './minimal-battery-power-renderer';
import { buildLongestSameZerosOnesSteps } from './longest-same-zeros-ones-renderer';
import {
  SHORTEST_UNSORTED_CODES,
  SMALLEST_RANGE_CODES,
  GROUP_BUY_TICKETS_CODES,
  SPLIT_MIN_AVG_SUM_CODES,
  MINIMAL_BATTERY_POWER_CODES,
  LONGEST_SAME_ZEROS_ONES_CODES,
} from './greedy-091-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|接收)/);

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

describe('左神贪心专题 3 (greedy-091) 自动化测试套件', () => {
  it('1. 最短无序连续子数组 (LeetCode 581)', () => {
    const nums = [2, 6, 4, 8, 10, 9, 15];
    const steps = buildShortestUnsortedSteps(nums);
    verifyLineMap(steps, SHORTEST_UNSORTED_CODES);
    const last = steps[steps.length - 1];
    expect(last.decision).toContain('5'); // [6, 4, 8, 10, 9] 长度为 5
  });

  it('2. 最小区间 (LeetCode 632)', () => {
    const lists = [
      [4, 10, 15, 24, 26],
      [0, 9, 12, 20],
      [5, 18, 22, 30],
    ];
    const steps = buildSmallestRangeSteps(lists);
    verifyLineMap(steps, SMALLEST_RANGE_CODES);
    const last = steps[steps.length - 1];
    expect(last.ansL).toBe(20);
    expect(last.ansR).toBe(24);
  });

  it('3. 组团买票问题', () => {
    const n = 8;
    const games: [number, number][] = [
      [2, 10],
      [1, 15],
      [3, 20],
    ];
    const steps = buildGroupBuyTicketsSteps(n, games);
    verifyLineMap(steps, GROUP_BUY_TICKETS_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalCost).toBeGreaterThan(0);
  });

  it('4. 平均值最小累加和', () => {
    const arr = [9, 1, 8, 2, 7, 3, 6];
    const k = 3;
    const steps = buildSplitMinAvgSumSteps(arr, k);
    verifyLineMap(steps, SPLIT_MIN_AVG_SUM_CODES);
    const last = steps[steps.length - 1];
    // 排序后 [1, 2, 3, 6, 7, 8, 9]
    // k=3: [1], [2], [3,6,7,8,9](sum=33, count=5, avg=6) -> 1+2+6=9
    expect(last.totalAvgSum).toBe(9);
  });

  it('5. 完成所有任务的最少初始能量 (LeetCode 1665)', () => {
    const tasks: [number, number][] = [
      [1, 2],
      [2, 4],
      [4, 8],
    ];
    const steps = buildMinimalBatteryPowerSteps(tasks);
    verifyLineMap(steps, MINIMAL_BATTERY_POWER_CODES);
    const last = steps[steps.length - 1];
    expect(last.ans).toBe(11);
  });

  it('6. 两个 0 和 1 数量相等区间的最大长度', () => {
    const arr = [0, 1, 0, 0, 1, 0];
    const steps = buildLongestSameZerosOnesSteps(arr);
    verifyLineMap(steps, LONGEST_SAME_ZEROS_ONES_CODES);
    const last = steps[steps.length - 1];
    expect(last.maxLen).toBe(5); // n-1 = 5 (arr[0]=0 == arr[5]=0)
  });
});
