import { describe, it, expect } from 'vitest';
import { buildPeakElementSteps } from './search/find-peak-element-renderer';
import { buildKokoSteps } from './search/koko-eating-bananas-renderer';
import { buildMaxPointsSteps } from './math/max-points-on-a-line-renderer';
import { buildCourseScheduleIVSteps } from './graph/course-schedule-iv-renderer';
import { buildLongestConsecutiveSteps } from './hash-table/longest-consecutive-sequence-renderer';
import { buildPalindromePartitionSteps } from './dynamic-programming/palindrome-partitioning-ii-renderer';
import { buildRemoveKDigitsSteps } from './monotonic-stack/remove-k-digits-renderer';
import { buildSubarraySumSteps } from './hash-table/subarray-sum-equals-k-renderer';
import { buildCharacterReplacementSteps } from './string/longest-repeating-character-replacement-renderer';

describe('大厂面试经典题与通关课扩展 08 测试套件', () => {
  // 1. 寻找峰值 (LeetCode 162)
  describe('大厂真题: 寻找峰值 (Find Peak Element)', () => {
    it('在无序数组中二分锁定峰值', () => {
      const arr = [1, 2, 1, 3, 5, 6, 4];
      const steps = buildPeakElementSteps(arr);
      const last = steps[steps.length - 1];
      expect(last.peakIdx).toBeDefined();
      expect([1, 5]).toContain(last.peakIdx); // 峰值可能在 1 或 5
    });
  });

  // 2. 爱吃香蕉的珂珂 (LeetCode 875)
  describe('大厂真题: 爱吃香蕉的珂珂 (Koko Eating Bananas)', () => {
    it('二分答案法求解最小吃速', () => {
      const piles = [3, 6, 7, 11];
      const h = 8;
      const steps = buildKokoSteps(piles, h);
      const last = steps[steps.length - 1];
      expect(last.bestSpeed).toBe(4);
    });
  });

  // 3. 直线上最多的点数 (LeetCode 149)
  describe('大厂真题: 直线上最多的点数 (Max Points on a Line)', () => {
    it('GCD 斜率化简统计最多共线点数', () => {
      const pts = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      const steps = buildMaxPointsSteps(pts);
      const last = steps[steps.length - 1];
      expect(last.globalMax).toBe(3);
    });
  });

  // 4. 课程表 IV (LeetCode 1462)
  describe('大厂真题: 课程表 IV (Course Schedule IV)', () => {
    it('拓扑排序传递闭包回答先修可达性', () => {
      const steps = buildCourseScheduleIVSteps(
        3,
        [
          [0, 1],
          [1, 2],
        ],
        [
          [0, 2],
          [2, 0],
        ]
      );
      const last = steps[steps.length - 1];
      expect(last.queryResults).toEqual([
        { u: 0, v: 2, ans: true },
        { u: 2, v: 0, ans: false },
      ]);
    });
  });

  // 5. 最长连续序列 (LeetCode 128)
  describe('大厂真题: 最长连续序列 (Longest Consecutive Sequence)', () => {
    it('哈希表起点跳过 O(N) 求解最长连续序列', () => {
      const steps = buildLongestConsecutiveSteps([100, 4, 200, 1, 3, 2]);
      const last = steps[steps.length - 1];
      expect(last.maxLen).toBe(4); // 1, 2, 3, 4
      expect(last.longestStreak).toEqual([1, 2, 3, 4]);
    });
  });

  // 6. 分割回文串 II (LeetCode 132)
  describe('大厂真题: 分割回文串 II (Palindrome Partitioning II)', () => {
    it('预处理回文矩阵配合线性 DP 计算最少分割次数', () => {
      const steps = buildPalindromePartitionSteps('aab');
      const last = steps[steps.length - 1];
      expect(last.dp[last.dp.length - 1]).toBe(1); // "aa" + "b" -> 1 刀
    });
  });

  // 7. 移掉 K 位数字 (LeetCode 402)
  describe('大厂真题: 移掉 K 位数字 (Remove K Digits)', () => {
    it('单调递增栈贪心剔除高位逆序', () => {
      const steps = buildRemoveKDigitsSteps('1432219', 3);
      const last = steps[steps.length - 1];
      expect(last.finalResult).toBe('1219');
    });

    it('消除前导零用例', () => {
      const steps = buildRemoveKDigitsSteps('10200', 1);
      const last = steps[steps.length - 1];
      expect(last.finalResult).toBe('200');
    });
  });

  // 8. 和为 K 的子数组 (LeetCode 560)
  describe('大厂真题: 和为 K 的子数组 (Subarray Sum Equals K)', () => {
    it('前缀和哈希表统计合格子数组数', () => {
      const steps = buildSubarraySumSteps([1, 1, 1], 2);
      const last = steps[steps.length - 1];
      expect(last.totalCount).toBe(2);
    });
  });

  // 9. 替换后的最长重复字符 (LeetCode 424)
  describe('大厂真题: 替换后的最长重复字符 (Longest Repeating Character Replacement)', () => {
    it('滑动窗口单调不减求解最长字符', () => {
      const steps = buildCharacterReplacementSteps('AABABBA', 1);
      const last = steps[steps.length - 1];
      expect(last.bestLen).toBe(4);
    });
  });
});
