import { describe, it, expect } from 'vitest';
import { buildMinimizeDeviationSteps } from './minimize-deviation-renderer';
import { buildRabbitsInForestSteps } from './rabbits-in-forest-renderer';
import { buildMinOperationsSimilarSteps } from './min-operations-similar-renderer';
import { buildQuizScoreSteps } from './quiz-score-renderer';
import { buildDivideArraySeqSteps } from './divide-array-seq-renderer';
import { buildMinRefuelingStopsSteps } from './min-refueling-stops-renderer';
import {
  MINIMIZE_DEVIATION_CODES,
  RABBITS_IN_FOREST_CODES,
  MIN_OPERATIONS_SIMILAR_CODES,
  QUIZ_SCORE_CODES,
  DIVIDE_ARRAY_SEQ_CODES,
  MIN_REFUELING_STOPS_CODES,
} from './greedy-092-stage-codes';

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

describe('左神贪心专题 4 (greedy-092) 自动化测试套件', () => {
  it('1. 数组的最小偏移量 (LeetCode 1675)', () => {
    const nums = [4, 1, 5, 20, 3];
    const steps = buildMinimizeDeviationSteps(nums);
    verifyLineMap(steps, MINIMIZE_DEVIATION_CODES);
    const last = steps[steps.length - 1];
    expect(last.ans).toBe(3);
  });

  it('2. 森林中的兔子 (LeetCode 781)', () => {
    const answers = [1, 1, 2];
    const steps = buildRabbitsInForestSteps(answers);
    verifyLineMap(steps, RABBITS_IN_FOREST_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalRabbits).toBe(5);
  });

  it('3. 使数组相似的最少操作次数 (LeetCode 2449)', () => {
    const nums = [8, 12, 6];
    const target = [2, 14, 10];
    const steps = buildMinOperationsSimilarSteps(nums, target);
    verifyLineMap(steps, MIN_OPERATIONS_SIMILAR_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalOps).toBe(2);
  });

  it('4. 知识竞赛得分最大化', () => {
    const questions: [number, number][] = [
      [10, 2],
      [8, 5],
      [6, 6],
      [3, 7],
    ];
    const k = 2;
    const steps = buildQuizScoreSteps(questions, k);
    verifyLineMap(steps, QUIZ_SCORE_CODES);
    const last = steps[steps.length - 1];
    expect(last.totalScore).toBe(31); // A:[10, 8], B:[6, 7] -> 10+8+6+7 = 31
  });

  it('5. 将数组分成几个递增序列 (LeetCode 1121)', () => {
    const nums = [1, 2, 2, 3, 3, 4, 4];
    const k = 3;
    const steps = buildDivideArraySeqSteps(nums, k);
    verifyLineMap(steps, DIVIDE_ARRAY_SEQ_CODES);
    const last = steps[steps.length - 1];
    expect(last.canDivide).toBe(true); // maxFreq=2, 2*3=6 <= 7 -> true
  });

  it('6. 最低加油次数 (LeetCode 871)', () => {
    const target = 100;
    const startFuel = 10;
    const stations: [number, number][] = [
      [10, 60],
      [20, 30],
      [30, 30],
      [60, 40],
    ];
    const steps = buildMinRefuelingStopsSteps(target, startFuel, stations);
    verifyLineMap(steps, MIN_REFUELING_STOPS_CODES);
    const last = steps[steps.length - 1];
    expect(last.stops).toBe(2);
  });
});
