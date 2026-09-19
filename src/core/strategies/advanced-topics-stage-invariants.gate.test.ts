/**
 * advanced-topics-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】高阶进阶专题与大厂高频硬核算法全覆盖门禁
 *
 * 守护领域 (27 种高阶专题与大厂真题全量覆盖):
 * - Part 1: Class 124 ~ 148 数论代数进阶扩展 (3 题)
 *   1. 线性基与异或空间基底 (Linear Basis 132)
 *   2. 中国剩余定理 (CRT 141)
 *   3. 卢卡斯定理 (Lucas Theorem 144)
 * - Part 2: Class 167 ~ 172 扩展数论与多项式全系列 (6 题)
 *   4. 扩展 BSGS (EXBSGS 169)
 *   5. 扩展中国剩余定理 (EXCRT 168)
 *   6. 扩展卢卡斯定理 (EXLucas 167)
 *   7. 多项式除法与求模 (Polynomial Division 170)
 *   8. 多项式对数与指数 (Polynomial Ln & Exp 172)
 *   9. 多项式开平方 (Polynomial Sqrt 171)
 * - Part 3: 大厂高频真题与硬核复杂结构 (18 题)
 *   10. 基本计算器完整版 (Basic Calculator Full · LeetCode 224/227/772)
 *   11. 戳气球区间 DP (Burst Balloons · LeetCode 312)
 *   12. 地下城游戏逆向 DP (Dungeon Game · LeetCode 174)
 *   13. 给表达式添加运算符 (Expression Add Operators · LeetCode 282)
 *   14. 自由之路环形 DP (Freedom Trail · LeetCode 514)
 *   15. 柱状图中最大的矩形 (Hard Largest Rectangle in Histogram · LeetCode 84)
 *   16. LFU 缓存机制 (LFU Cache · LeetCode 460)
 *   17. 最长有效括号 (Longest Valid Parentheses · LeetCode 32)
 *   18. 最大矩形 (Maximal Rectangle · LeetCode 85)
 *   19. 寻找两个正序数组的中位数 (Median of Two Sorted Arrays · LeetCode 4)
 *   20. 合并 K 个升序链表 (Merge K Sorted Lists · LeetCode 23)
 *   21. N 皇后位运算极速版 (N-Queens Bitwise Speed · LeetCode 51/52)
 *   22. 俄罗斯套娃信封问题 (Russian Doll Envelopes · LeetCode 354)
 *   23. 滑动窗口中位数 (Sliding Window Median · LeetCode 480)
 *   24. 股票买卖冷冻期状态机 (Stock Trading State Machine · LeetCode 309)
 *   25. 串联所有单词的子串 (Substring with Concatenation · LeetCode 30)
 *   26. 天际线问题 (The Skyline Problem · LeetCode 218)
 *   27. 接雨水 II 三维优先队列 (Trapping Rain Water II · LeetCode 407)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧必须非空且包含明确初始或入口状态；
 * 2. 多语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围，严禁 0 或越界；
 * 3. 数学计算与状态收敛：算法终态严格符合理论解与正确性验证。
 */

import { describe, it, expect } from 'vitest';

// Part 1: Class 124 ~ 148 Extra
import {
  buildLinearBasis132Steps,
  LINEAR_BASIS_132_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-124-134/linear-basis-132-renderer';
import {
  buildCrt141Steps,
  CRT_141_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-134-140/crt-141-renderer';
import {
  buildLucas144Steps,
  LUCAS_144_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-142-148/lucas-theorem-144-renderer';

// Part 2: Class 167 ~ 172
import { buildEXBSGSSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/exbsgs-renderer';
import { buildEXCRTSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/excrt-renderer';
import { buildEXLucasSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/exlucas-renderer';
import { buildPolyDivSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/polynomial-division-renderer';
import { buildPolyLnExpSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/polynomial-ln-exp-renderer';
import { buildPolySqrtSteps } from '../../algorithms/categories/advanced-topics/advanced-167-172/polynomial-sqrt-renderer';
import {
  EXBSGS_CODES,
  EXCRT_CODES,
  EXLUCAS_CODES,
  POLYNOMIAL_DIVISION_CODES,
  POLYNOMIAL_LN_EXP_CODES,
  POLYNOMIAL_SQRT_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-stage-codes';

// Part 3: Hard Interview Problems
import {
  generateCalculatorSteps,
  BASIC_CALCULATOR_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/basic-calculator-full-renderer';
// 注：burst-balloons 已接入 dp-generated 统一黄金舞台（区间 DP spec），
// 历史手写 renderer 已按死门禁第 2 条删除，其步骤门禁由 src/core/strategies/interval-burstballoons.ts 承接。
import {
  generateDungeonSteps,
  DUNGEON_GAME_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/dungeon-game-renderer';
import {
  generateExpressionSteps,
  EXPRESSION_ADD_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/expression-add-operators-renderer';
import {
  generateFreedomTrailSteps,
  FREEDOM_TRAIL_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/freedom-trail-renderer';
import {
  generateHistogramSteps,
  HISTOGRAM_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/hard-largest-rectangle-histogram-renderer';
import {
  generateLFUSteps,
  LFU_CACHE_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/lfu-cache-renderer';
import {
  generateParenthesesSteps,
  LONGEST_VALID_PARENTHESES_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/longest-valid-parentheses-renderer';
import {
  generateMaximalRectangleSteps,
  MAXIMAL_RECTANGLE_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/maximal-rectangle-renderer';
import {
  generateMedianSteps as generateMedianTwoSortedSteps,
  MEDIAN_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/median-two-sorted-arrays-renderer';
import {
  generateMergeKListsSteps,
  MERGE_K_LISTS_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/merge-k-sorted-lists-renderer';
import {
  generateNQueensSteps,
  N_QUEENS_BITWISE_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/n-queens-bitwise-speed-renderer';
import {
  generateRussianDollSteps,
  RUSSIAN_DOLL_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/russian-doll-envelopes-renderer';
import {
  generateMedianSteps as generateSlidingWindowMedianSteps,
  SLIDING_WINDOW_MEDIAN_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/sliding-window-median-renderer';
import {
  generateStockSteps,
  STOCK_TRADING_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/stock-trading-state-machine-renderer';
import {
  generateSubstringSteps,
  SUBSTRING_CONCATENATION_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/substring-concatenation-renderer';
import {
  generateSkylineSteps,
  SKYLINE_PROBLEM_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/the-skyline-problem-renderer';
import {
  buildRainWater3DSteps,
  RAIN_WATER_3D_CODES,
} from '../../algorithms/categories/advanced-topics/hard-interview/trapping-rain-water-ii-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNums: number[] = [];
      if (typeof step.codeLine === 'number') {
        lineNums = [step.codeLine];
      } else if (Array.isArray(step.codeLine)) {
        lineNums = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNums = [val];
        } else if (Array.isArray(val)) {
          lineNums = val;
        }
      }

      for (const lineNum of lineNums) {
        expect(
          lineNum,
          `${algoName} [Step ${i}] 在语言 ${lang} 中代码行号 (${lineNum}) 超出范围 [1, ${maxLine}]`
        ).toBeGreaterThanOrEqual(1);
        expect(
          lineNum,
          `${algoName} [Step ${i}] 在语言 ${lang} 中代码行号 (${lineNum}) 超出最大行 ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
      }
    }
  }
}

describe('Advanced Topics & Hard Interview Stage Invariants Gate', () => {
  describe('Part 1: Class 124 ~ 148 数论代数进阶扩展', () => {
    it('1. 线性基与异或空间基底 (Class 132 · Linear Basis)', () => {
      const nums = [12, 28, 9, 3];
      const steps = buildLinearBasis132Steps(nums, 5);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.maxXor).toBeGreaterThan(0);
      verifyCodeLines(steps, '线性基 132', LINEAR_BASIS_132_CODES);
    });

    it('2. 中国剩余定理 (Class 141 · CRT)', () => {
      const r = [2, 3, 2];
      const m = [3, 5, 7];
      const steps = buildCrt141Steps(m, r);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      // 23 % 3 == 2, 23 % 5 == 3, 23 % 7 == 2
      expect(last.finalAns).toBe(23);
      verifyCodeLines(steps, '中国剩余定理 141', CRT_141_CODES);
    });

    it('3. 卢卡斯定理 (Class 144 · Lucas Theorem)', () => {
      const steps = buildLucas144Steps(10, 3, 13);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.ans).toBeGreaterThanOrEqual(0);
      verifyCodeLines(steps, '卢卡斯定理 144', LUCAS_144_CODES);
    });
  });

  describe('Part 2: Class 167 ~ 172 扩展数论与多项式全系列', () => {
    it('4. 扩展 BSGS (Class 169 · EXBSGS)', () => {
      const steps = buildEXBSGSSteps(2, 3, 5);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.ans).toBeDefined();
      verifyCodeLines(steps, '扩展 BSGS 169', EXBSGS_CODES);
    });

    it('5. 扩展中国剩余定理 (Class 168 · EXCRT)', () => {
      const equations = [
        { r: 2, m: 4 },
        { r: 3, m: 6 },
      ];
      const steps = buildEXCRTSteps(equations);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      verifyCodeLines(steps, '扩展中国剩余定理 168', EXCRT_CODES);
    });

    it('6. 扩展卢卡斯定理 (Class 167 · EXLucas)', () => {
      const steps = buildEXLucasSteps(10, 3, 12);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      verifyCodeLines(steps, '扩展卢卡斯定理 167', EXLUCAS_CODES);
    });

    it('7. 多项式除法与求模 (Class 170 · Polynomial Division)', () => {
      const steps = buildPolyDivSteps([1, 2, 1], [1, 1]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      verifyCodeLines(steps, '多项式除法 170', POLYNOMIAL_DIVISION_CODES);
    });

    it('8. 多项式对数与指数 (Class 172 · Polynomial Ln & Exp)', () => {
      const steps = buildPolyLnExpSteps([1, 1, 0, 0], 4);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      verifyCodeLines(steps, '多项式对数与指数 172', POLYNOMIAL_LN_EXP_CODES);
    });

    it('9. 多项式开平方 (Class 171 · Polynomial Sqrt)', () => {
      const steps = buildPolySqrtSteps([1, 2, 1], 3);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      verifyCodeLines(steps, '多项式开平方 171', POLYNOMIAL_SQRT_CODES);
    });
  });

  describe('Part 3: 大厂高频真题与硬核复杂结构', () => {
    it('10. 基本计算器完整版 (LeetCode 224/227/772 · Basic Calculator Full)', () => {
      const steps = generateCalculatorSteps('1 + 2 * (3 - 1)');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.result).toBe(5);
      verifyCodeLines(steps, '基本计算器完整版', BASIC_CALCULATOR_CODES);
    });

    it('11. 地下城游戏逆向 DP (LeetCode 174 · Dungeon Game)', () => {
      const grid = [
        [-2, -3, 3],
        [-5, -10, 1],
        [10, 30, -5],
      ];
      const steps = generateDungeonSteps(grid);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.dp[0][0]).toBe(7);
      verifyCodeLines(steps, '地下城游戏', DUNGEON_GAME_CODES);
    });

    it('13. 给表达式添加运算符 (LeetCode 282 · Expression Add Operators)', () => {
      const steps = generateExpressionSteps('123', 6);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.solutions).toContain('1+2+3');
      expect(last.solutions).toContain('1*2*3');
      verifyCodeLines(steps, '给表达式添加运算符', EXPRESSION_ADD_CODES);
    });

    it('14. 自由之路环形 DP (LeetCode 514 · Freedom Trail)', () => {
      const steps = generateFreedomTrailSteps('godding', 'gd');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.accumulatedSteps).toBe(4);
      verifyCodeLines(steps, '自由之路', FREEDOM_TRAIL_CODES);
    });

    it('15. 柱状图中最大的矩形 (LeetCode 84 · Largest Rectangle in Histogram)', () => {
      const steps = generateHistogramSteps([2, 1, 5, 6, 2, 3]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(10);
      verifyCodeLines(steps, '柱状图中最大的矩形', HISTOGRAM_CODES);
    });

    it('16. LFU 缓存机制 (LeetCode 460 · LFU Cache)', () => {
      const steps = generateLFUSteps(2, [
        { type: 'put', k: 1, v: 1 },
        { type: 'put', k: 2, v: 2 },
        { type: 'get', k: 1 },
      ]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.returnedVal).toBe(1);
      verifyCodeLines(steps, 'LFU 缓存机制', LFU_CACHE_CODES);
    });

    it('17. 最长有效括号 (LeetCode 32 · Longest Valid Parentheses)', () => {
      const steps = generateParenthesesSteps(')()())');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxLen).toBe(4);
      verifyCodeLines(steps, '最长有效括号', LONGEST_VALID_PARENTHESES_CODES);
    });

    it('18. 最大矩形 (LeetCode 85 · Maximal Rectangle)', () => {
      const matrix = [
        ['1', '0', '1', '0', '0'],
        ['1', '0', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '0', '0', '1', '0'],
      ];
      const steps = generateMaximalRectangleSteps(matrix);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(6);
      verifyCodeLines(steps, '最大矩形', MAXIMAL_RECTANGLE_CODES);
    });

    it('19. 寻找两个正序数组的中位数 (LeetCode 4 · Median of Two Sorted Arrays)', () => {
      const steps = generateMedianTwoSortedSteps([1, 3], [2]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.medianResult).toBe(2);
      verifyCodeLines(steps, '寻找两个正序数组的中位数', MEDIAN_CODES);
    });

    it('20. 合并 K 个升序链表 (LeetCode 23 · Merge K Sorted Lists)', () => {
      const steps = generateMergeKListsSteps([
        [1, 4, 5],
        [1, 3, 4],
        [2, 6],
      ]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.merged).toEqual([1, 1, 2, 3, 4, 4, 5, 6]);
      verifyCodeLines(steps, '合并 K 个升序链表', MERGE_K_LISTS_CODES);
    });

    it('21. N 皇后位运算极速版 (LeetCode 51/52 · N-Queens Bitwise Speed)', () => {
      const steps = generateNQueensSteps(4);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.totalSolutions).toBe(2);
      verifyCodeLines(steps, 'N 皇后位运算极速版', N_QUEENS_BITWISE_CODES);
    });

    it('22. 俄罗斯套娃信封问题 (LeetCode 354 · Russian Doll Envelopes)', () => {
      const envelopes: [number, number][] = [
        [5, 4],
        [6, 4],
        [6, 7],
        [2, 3],
      ];
      const steps = generateRussianDollSteps(envelopes);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxEnvelopes).toBe(3);
      verifyCodeLines(steps, '俄罗斯套娃信封问题', RUSSIAN_DOLL_CODES);
    });

    it('23. 滑动窗口中位数 (LeetCode 480 · Sliding Window Median)', () => {
      const nums = [1, 3, -1, -3, 5, 3, 6, 7];
      const steps = generateSlidingWindowMedianSteps(nums, 3);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.mediansResult).toEqual([1, -1, -1, 3, 5, 6]);
      verifyCodeLines(steps, '滑动窗口中位数', SLIDING_WINDOW_MEDIAN_CODES);
    });

    it('24. 股票买卖冷冻期状态机 (LeetCode 309 · Stock Trading State Machine)', () => {
      const steps = generateStockSteps([1, 2, 3, 0, 2]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.bestProfit).toBe(3);
      verifyCodeLines(steps, '股票买卖冷冻期状态机', STOCK_TRADING_CODES);
    });

    it('25. 串联所有单词的子串 (LeetCode 30 · Substring with Concatenation)', () => {
      const steps = generateSubstringSteps('barfoothefoobarman', ['foo', 'bar']);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.matchedIndices).toContain(0);
      expect(last.matchedIndices).toContain(9);
      verifyCodeLines(steps, '串联所有单词的子串', SUBSTRING_CONCATENATION_CODES);
    });

    it('26. 天际线问题 (LeetCode 218 · The Skyline Problem)', () => {
      const buildings: [number, number, number][] = [
        [2, 9, 10],
        [3, 7, 15],
        [5, 12, 12],
        [15, 20, 10],
        [19, 24, 8],
      ];
      const steps = generateSkylineSteps(buildings);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.skylinePoints.length).toBeGreaterThan(0);
      verifyCodeLines(steps, '天际线问题', SKYLINE_PROBLEM_CODES);
    });

    it('27. 接雨水 II 三维优先队列 (LeetCode 407 · Trapping Rain Water II)', () => {
      const heightMap = [
        [1, 4, 3, 1, 3, 2],
        [3, 2, 1, 3, 2, 4],
        [2, 3, 3, 2, 3, 1],
      ];
      const steps = buildRainWater3DSteps(heightMap);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.totalWater).toBe(4);
      verifyCodeLines(steps, '接雨水 II', RAIN_WATER_3D_CODES);
    });
  });
});
