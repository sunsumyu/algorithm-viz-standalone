import { describe, it, expect } from 'vitest';
import { buildTwoSumSteps } from './two-sum-renderer';
import { buildThreeSumSteps } from './three-sum-renderer';
import { buildFourSumSteps } from './four-sum-renderer';
import { buildAnagramSteps } from './anagram-renderer';
import { buildFourSumIISteps } from './four-sum-ii-renderer';
import { buildHappyNumberSteps } from './happy-number-renderer';
import { buildIntersectionSteps } from './intersection-of-two-arrays-renderer';
import { buildRansomNoteSteps } from './ransom-note-renderer';
import { buildTheorySteps } from './hash-table-theory-renderer';

describe('Hash Table Category Modernized Algorithms (哈希表全套核心算法推导测试)', () => {
  describe('1. Two Sum (LeetCode 1 · 两数之和)', () => {
    it('nums=[2, 7, 11, 15], target=9 正确返回下标 [0, 1]', () => {
      const steps = buildTwoSumSteps([2, 7, 11, 15], 9);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.result).toEqual([0, 1]);
    });

    it('nums=[3, 2, 4], target=6 正确返回下标 [1, 2]', () => {
      const steps = buildTwoSumSteps([3, 2, 4], 6);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.result).toEqual([1, 2]);
    });
  });

  describe('2. Three Sum (LeetCode 15 · 三数之和)', () => {
    it('nums=[-1, 0, 1, 2, -1, -4] 正确去重并返回 2 组解 [[-1, -1, 2], [-1, 0, 1]]', () => {
      const steps = buildThreeSumSteps([-1, 0, 1, 2, -1, -4]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.results).toEqual([
        [-1, -1, 2],
        [-1, 0, 1],
      ]);
    });

    it('nums=[0, 1, 1] 无合法解返回空数组', () => {
      const steps = buildThreeSumSteps([0, 1, 1]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.results).toEqual([]);
    });
  });

  describe('3. Four Sum (LeetCode 18 · 四数之和)', () => {
    it('nums=[1, 0, -1, 0, -2, 2], target=0 正确返回 3 组解', () => {
      const steps = buildFourSumSteps([1, 0, -1, 0, -2, 2], 0);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.results).toEqual([
        [-2, -1, 1, 2],
        [-2, 0, 0, 2],
        [-1, 0, 0, 1],
      ]);
    });

    it('全相同元素 nums=[2, 2, 2, 2, 2], target=8 正确返回 1 组解 [[2, 2, 2, 2]]', () => {
      const steps = buildFourSumSteps([2, 2, 2, 2, 2], 8);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.results).toEqual([[2, 2, 2, 2]]);
    });
  });

  describe('4. Valid Anagram (LeetCode 242 · 有效的字母异位词)', () => {
    it('s="anagram", t="nagaram" 返回 true', () => {
      const steps = buildAnagramSteps('anagram', 'nagaram');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isMatch).toBe(true);
    });

    it('s="rat", t="car" 返回 false', () => {
      const steps = buildAnagramSteps('rat', 'car');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isMatch).toBe(false);
    });

    it('长度不一致 s="a", t="ab" 返回 false', () => {
      const steps = buildAnagramSteps('a', 'ab');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isMatch).toBe(false);
    });
  });

  describe('5. 4Sum II (LeetCode 454 · 四数相加 II)', () => {
    it('示例 1 四数组组合产生 2 个和为 0 的元组', () => {
      const steps = buildFourSumIISteps([1, 2], [-2, -1], [-1, 2], [0, 2]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.count).toBe(2);
    });

    it('全零数组产生 16 个元组', () => {
      const steps = buildFourSumIISteps([0, 0], [0, 0], [0, 0], [0, 0]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.count).toBe(16);
    });
  });

  describe('6. Happy Number (LeetCode 202 · 快乐数)', () => {
    it('n=19 判定为快乐数 (true)', () => {
      const steps = buildHappyNumberSteps(19);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isHappy).toBe(true);
      expect(lastStep.status).toBe('happy');
    });

    it('n=2 陷入循环判定为非快乐数 (false)', () => {
      const steps = buildHappyNumberSteps(2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isHappy).toBe(false);
      expect(lastStep.status).toBe('cycle');
    });
  });

  describe('7. Intersection of Two Arrays (LeetCode 349 · 两个数组的交集)', () => {
    it('nums1=[1,2,2,1], nums2=[2,2] 正确求出唯一交集 [2]', () => {
      const steps = buildIntersectionSteps([1, 2, 2, 1], [2, 2]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.resultSet).toEqual([2]);
    });

    it('nums1=[4,9,5], nums2=[9,4,9,8,4] 正确求出交集 [9,4]', () => {
      const steps = buildIntersectionSteps([4, 9, 5], [9, 4, 9, 8, 4]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.resultSet.sort()).toEqual([4, 9]);
    });
  });

  describe('8. Ransom Note (LeetCode 383 · 赎金信)', () => {
    it('ransomNote="aa", magazine="aab" 能够构成 (true)', () => {
      const steps = buildRansomNoteSteps('aa', 'aab');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.canConstruct).toBe(true);
    });

    it('ransomNote="aa", magazine="ab" 字符不足 (false)', () => {
      const steps = buildRansomNoteSteps('aa', 'ab');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.canConstruct).toBe(false);
    });
  });

  describe('9. Hash Table Theory (哈希表理论基础与冲突解决)', () => {
    it('容量为 6 的桶阵列正确处理哈希映射与链表碰撞挂载', () => {
      const steps = buildTheorySteps([12, 18, 24, 7, 13], 6);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.buckets[0]).toEqual([12, 18, 24]);
      expect(lastStep.buckets[1]).toEqual([7, 13]);
    });
  });
});
