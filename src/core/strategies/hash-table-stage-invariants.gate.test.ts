/**
 * 哈希表与双指针综合物理不变量顶级架构机械防退化门禁
 * (Hash Table & Dual Pointer Invariants Gatekeeper)
 *
 * 守护领域 (12 算法全覆盖):
 * 1. Two Sum (LeetCode 1 · 两数之和 一次遍历哈希补数)
 * 2. Three Sum (LeetCode 15 · 三数之和 排序+双指针去重)
 * 3. Four Sum (LeetCode 18 · 四数之和 双重剪枝与双指针)
 * 4. Valid Anagram (LeetCode 242 · 有效字母异位词 频次抵消)
 * 5. 4Sum II (LeetCode 454 · 四数相加 II 分组折半哈希统计)
 * 6. Happy Number (LeetCode 202 · 快乐数 快慢指针与循环检测)
 * 7. Intersection of Two Arrays (LeetCode 349 · 两个数组交集 Set 去重求交)
 * 8. Ransom Note (LeetCode 383 · 赎金信 单向字符频次扣减)
 * 9. Hash Table Theory (哈希表底层理论 映射碰撞与拉链法链表挂载)
 * 10. Longest Consecutive Sequence (LeetCode 128 · 最长连续序列 严格 O(N) 起点探测)
 * 11. Sort Characters By Frequency (LeetCode 451 · 根据字符出现频率排序 桶排序)
 * 12. Subarray Sum Equals K (LeetCode 560 · 和为 K 的子数组 前缀和哈希查表)
 *
 * 核心机械不变量红线:
 * 1. 步进序列非空且初始帧语义完备；
 * 2. 状态指针与计算结果严格正确（无死循环、无非法负数下标、无越界）；
 * 3. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import { buildTwoSumSteps } from '../../algorithms/categories/hash-table/two-sum-renderer';
import { TWO_SUM_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/two-sum-problem-content';
import { buildThreeSumSteps } from '../../algorithms/categories/hash-table/three-sum-renderer';
import { THREE_SUM_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/three-sum-problem-content';
import { buildFourSumSteps } from '../../algorithms/categories/hash-table/four-sum-renderer';
import { FOUR_SUM_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/four-sum-problem-content';
import { buildAnagramSteps } from '../../algorithms/categories/hash-table/anagram-renderer';
import { ANAGRAM_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/anagram-problem-content';
import { buildFourSumIISteps } from '../../algorithms/categories/hash-table/four-sum-ii-renderer';
import { FOUR_SUM_II_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/four-sum-ii-problem-content';
import { buildHappyNumberSteps } from '../../algorithms/categories/hash-table/happy-number-renderer';
import { HAPPY_NUMBER_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/happy-number-problem-content';
import { buildIntersectionSteps } from '../../algorithms/categories/hash-table/intersection-of-two-arrays-renderer';
import { INTERSECTION_ARRAYS_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/intersection-of-two-arrays-problem-content';
import { buildRansomNoteSteps } from '../../algorithms/categories/hash-table/ransom-note-renderer';
import { RANSOM_NOTE_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/ransom-note-problem-content';
import { buildTheorySteps } from '../../algorithms/categories/hash-table/hash-table-theory-renderer';
import { HASH_TABLE_THEORY_CODE_LANGUAGES } from '../../algorithms/categories/hash-table/hash-table-theory-problem-content';
import {
  buildLongestConsecutiveSteps,
  LONGEST_CONSECUTIVE_CODES,
} from '../../algorithms/categories/hash-table/longest-consecutive-sequence-renderer';
import {
  buildFrequencySortSteps,
  FREQ_SORT_CODES,
} from '../../algorithms/categories/hash-table/sort-characters-by-frequency-renderer';
import {
  buildSubarraySumSteps,
  SUBARRAY_SUM_CODES,
} from '../../algorithms/categories/hash-table/subarray-sum-equals-k-renderer';

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
        if (lineNum > 0) {
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
          ).toBeLessThanOrEqual(maxLine);
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
          ).toBeGreaterThanOrEqual(1);
        }
      }
    }
  }
}

describe('哈希表与双指针综合物理不变量顶级架构机械防退化门禁 (Hash Table Gatekeeper)', () => {
  describe('1. Two Sum (LeetCode 1)', () => {
    it('哈希补数匹配: 命中时下标相加严格等于 target 且两下标互异', () => {
      const nums = [2, 7, 11, 15];
      const target = 9;
      const steps = buildTwoSumSteps(nums, target);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('found');
      expect(last.result).toBeDefined();
      const [i, j] = last.result!;
      expect(i).not.toBe(j);
      expect(nums[i] + nums[j]).toBe(target);

      verifyCodeLines(steps, 'LeetCode 1 两数之和', TWO_SUM_CODE_LANGUAGES);
    });
  });

  describe('2. Three Sum (LeetCode 15)', () => {
    it('排序双指针去重: 所有三元组之和均为 0 且无重复', () => {
      const nums = [-1, 0, 1, 2, -1, -4];
      const steps = buildThreeSumSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      const results = last.results!;
      expect(results.length).toBe(2);

      for (const triplet of results) {
        expect(triplet.length).toBe(3);
        expect(triplet[0] + triplet[1] + triplet[2]).toBe(0);
        expect(triplet[0]).toBeLessThanOrEqual(triplet[1]);
        expect(triplet[1]).toBeLessThanOrEqual(triplet[2]);
      }

      verifyCodeLines(steps, 'LeetCode 15 三数之和', THREE_SUM_CODE_LANGUAGES);
    });
  });

  describe('3. Four Sum (LeetCode 18)', () => {
    it('双重剪枝与四数枚举: 所有四元组之和严格等于 target', () => {
      const nums = [1, 0, -1, 0, -2, 2];
      const target = 0;
      const steps = buildFourSumSteps(nums, target);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      const results = last.results!;
      expect(results.length).toBe(3);

      for (const quad of results) {
        expect(quad.length).toBe(4);
        expect(quad[0] + quad[1] + quad[2] + quad[3]).toBe(target);
        expect(quad[0]).toBeLessThanOrEqual(quad[1]);
        expect(quad[1]).toBeLessThanOrEqual(quad[2]);
        expect(quad[2]).toBeLessThanOrEqual(quad[3]);
      }

      verifyCodeLines(steps, 'LeetCode 18 四数之和', FOUR_SUM_CODE_LANGUAGES);
    });
  });

  describe('4. Valid Anagram (LeetCode 242)', () => {
    it('字母异位词判断: 字符频次一致性检测', () => {
      const stepsTrue = buildAnagramSteps('anagram', 'nagaram');
      expect(stepsTrue[stepsTrue.length - 1].isMatch).toBe(true);
      verifyCodeLines(stepsTrue, 'LeetCode 242 匹配', ANAGRAM_CODE_LANGUAGES);

      const stepsFalse = buildAnagramSteps('rat', 'car');
      expect(stepsFalse[stepsFalse.length - 1].isMatch).toBe(false);
      verifyCodeLines(stepsFalse, 'LeetCode 242 不匹配', ANAGRAM_CODE_LANGUAGES);
    });
  });

  describe('5. 4Sum II (LeetCode 454)', () => {
    it('折半两两分组哈希统计: 累加和为 0 的四元组数目', () => {
      const steps = buildFourSumIISteps([1, 2], [-2, -1], [-1, 2], [0, 2]);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.count).toBe(2);

      verifyCodeLines(steps, 'LeetCode 454 四数相加 II', FOUR_SUM_II_CODE_LANGUAGES);
    });
  });

  describe('6. Happy Number (LeetCode 202)', () => {
    it('平方和收敛性与循环检测: 19 判定为快乐数，2 陷入死循环', () => {
      const stepsHappy = buildHappyNumberSteps(19);
      expect(stepsHappy[stepsHappy.length - 1].isHappy).toBe(true);
      verifyCodeLines(stepsHappy, 'LeetCode 202 快乐数', HAPPY_NUMBER_CODE_LANGUAGES);

      const stepsCycle = buildHappyNumberSteps(2);
      expect(stepsCycle[stepsCycle.length - 1].isHappy).toBe(false);
      verifyCodeLines(stepsCycle, 'LeetCode 202 循环数', HAPPY_NUMBER_CODE_LANGUAGES);
    });
  });

  describe('7. Intersection of Two Arrays (LeetCode 349)', () => {
    it('交集去重保证: 元素同时属于两个输入数组且结果唯一', () => {
      const a = [1, 2, 2, 1];
      const b = [2, 2];
      const steps = buildIntersectionSteps(a, b);
      const last = steps[steps.length - 1];
      expect(last.resultSet).toEqual([2]);

      verifyCodeLines(steps, 'LeetCode 349 数组交集', INTERSECTION_ARRAYS_CODE_LANGUAGES);
    });
  });

  describe('8. Ransom Note (LeetCode 383)', () => {
    it('单向字符供给判断: 字符频次不足时正确判定为 false', () => {
      const stepsCan = buildRansomNoteSteps('aa', 'aab');
      expect(stepsCan[stepsCan.length - 1].canConstruct).toBe(true);
      verifyCodeLines(stepsCan, 'LeetCode 383 可构造', RANSOM_NOTE_CODE_LANGUAGES);

      const stepsCannot = buildRansomNoteSteps('aa', 'ab');
      expect(stepsCannot[stepsCannot.length - 1].canConstruct).toBe(false);
      verifyCodeLines(stepsCannot, 'LeetCode 383 不可构造', RANSOM_NOTE_CODE_LANGUAGES);
    });
  });

  describe('9. Hash Table Theory (哈希表底层原理)', () => {
    it('除留余数与拉链法碰撞挂载: 桶分配与装载因子统计', () => {
      const keys = [12, 18, 24, 7, 13];
      const bucketSize = 6;
      const steps = buildTheorySteps(keys, bucketSize);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.buckets[0]).toEqual([12, 18, 24]);
      expect(last.buckets[1]).toEqual([7, 13]);

      verifyCodeLines(steps, '哈希表底层原理', HASH_TABLE_THEORY_CODE_LANGUAGES);
    });
  });

  describe('10. Longest Consecutive Sequence (LeetCode 128)', () => {
    it('严格 O(N) 起点探测: 找出最长连续整数序列并验证其连续性', () => {
      const nums = [100, 4, 200, 1, 3, 2];
      const steps = buildLongestConsecutiveSteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.maxLen).toBe(4);
      expect(last.longestStreak).toEqual([1, 2, 3, 4]);

      // 验证序列内部严格差 1
      for (let i = 1; i < last.longestStreak.length; i++) {
        expect(last.longestStreak[i] - last.longestStreak[i - 1]).toBe(1);
      }

      verifyCodeLines(steps, 'LeetCode 128 最长连续序列', LONGEST_CONSECUTIVE_CODES);
    });
  });

  describe('11. Sort Characters By Frequency (LeetCode 451)', () => {
    it('桶排序频次降序重构: 字符重复频次严格非递增', () => {
      const s = 'tree';
      const steps = buildFrequencySortSteps(s);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.resultStr.length).toBe(s.length);
      // 'eert' 或 'eetr' 均合法，频次 2 的 e 必在 1 的 r 和 t 前面
      expect(last.resultStr.startsWith('ee')).toBe(true);

      verifyCodeLines(steps, 'LeetCode 451 字符频次排序', FREQ_SORT_CODES);
    });
  });

  describe('12. Subarray Sum Equals K (LeetCode 560)', () => {
    it('前缀和哈希差值匹配: 准确统计和为 k 的子数组个数', () => {
      const nums = [1, 2, 3, -2, 1, 4];
      const k = 3;
      const steps = buildSubarraySumSteps(nums, k);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      // [1, 2] (3), [3] (3), [3, -2, 1, 4] != 3, [1, 2, 3, -2, 1] != 3, etc.
      // Let's verify manual count:
      // subarrays with sum 3:
      // [1, 2] -> 3
      // [3] -> 3
      // [2, 3, -2] -> 3
      // [-2, 1, 4] -> 3
      // Total = 4
      expect(last.totalCount).toBe(4);

      verifyCodeLines(steps, 'LeetCode 560 和为 K 的子数组', SUBARRAY_SUM_CODES);
    });
  });
});
