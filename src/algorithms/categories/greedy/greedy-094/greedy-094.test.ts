import { describe, it, expect } from 'vitest';
import { buildEliminateMonstersSteps } from './eliminate-monsters-renderer';
import { buildLargestPalindromicSteps } from './largest-palindromic-number-renderer';
import { buildMaxAvgPassRatioSteps } from './max-avg-pass-ratio-renderer';
import { buildMinCostHireWorkersSteps } from './min-cost-hire-workers-renderer';
import { buildCuttingTreeSteps } from './cutting-tree-renderer';
import { buildCookingPlanSteps } from './cooking-plan-renderer';
import {
  ELIMINATE_MONSTERS_CODES,
  LARGEST_PALINDROMIC_NUMBER_CODES,
  MAX_AVG_PASS_RATIO_CODES,
  MIN_COST_HIRE_WORKERS_CODES,
  CUTTING_TREE_CODES,
  COOKING_PLAN_CODES,
} from './greedy-094-stage-codes';

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

describe('左神贪心专题 6 (greedy-094) 自动化测试套件', () => {
  it('1. 消灭怪物的最大数量 (LeetCode 1921)', () => {
    const dist = [1, 3, 4];
    const speed = [1, 1, 1];
    const steps = buildEliminateMonstersSteps(dist, speed);
    verifyLineMap(steps, ELIMINATE_MONSTERS_CODES);
    const last = steps[steps.length - 1];
    expect(last.eliminatedCount).toBe(3);
  });

  it('2. 最大回文数字 (LeetCode 2384)', () => {
    const num = '444947137';
    const steps = buildLargestPalindromicSteps(num);
    verifyLineMap(steps, LARGEST_PALINDROMIC_NUMBER_CODES);
    const last = steps[steps.length - 1];
    expect(last.result).toBe('7449447');
  });

  it('3. 最大平均通过率 (LeetCode 1792)', () => {
    const classes: [number, number][] = [
      [1, 2],
      [3, 5],
      [2, 2],
    ];
    const extra = 2;
    const steps = buildMaxAvgPassRatioSteps(classes, extra);
    verifyLineMap(steps, MAX_AVG_PASS_RATIO_CODES);
    const last = steps[steps.length - 1];
    expect(last.avgRatio).toBeCloseTo(0.78333, 4);
  });

  it('4. 雇佣 K 名工人的最低成本 (LeetCode 857)', () => {
    const quality = [10, 20, 5];
    const wage = [70, 50, 30];
    const k = 2;
    const steps = buildMinCostHireWorkersSteps(quality, wage, k);
    verifyLineMap(steps, MIN_COST_HIRE_WORKERS_CODES);
    const last = steps[steps.length - 1];
    expect(last.bestCost).toBeCloseTo(105.0, 1);
  });

  it('5. 砍树问题 (Cutting Tree)', () => {
    const trees: [number, number][] = [
      [10, 2],
      [5, 5],
      [20, 1],
    ];
    const m = 2;
    const steps = buildCuttingTreeSteps(trees, m);
    verifyLineMap(steps, CUTTING_TREE_CODES);
    const last = steps[steps.length - 1];
    expect(last.dp[m]).toBe(32);
  });

  it('6. 做菜顺序 (LeetCode 1402)', () => {
    const satisfaction = [-1, -8, 0, 5, -9];
    const steps = buildCookingPlanSteps(satisfaction);
    verifyLineMap(steps, COOKING_PLAN_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalSum).toBe(14);
  });
});
