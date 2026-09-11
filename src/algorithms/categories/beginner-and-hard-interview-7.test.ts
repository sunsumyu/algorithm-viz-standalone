import { describe, it, expect } from 'vitest';
import { buildDivideSteps } from './bit-manipulation/divide-two-integers-renderer';
import { buildNextPermutationSteps } from './array/next-permutation-renderer';
import { buildValidParenthesisStringSteps } from './stack/valid-parenthesis-string-renderer';
import { buildProductLessThanKSteps } from './array/subarray-product-less-than-k-renderer';
import { buildFindAllAnagramsSteps } from './string/find-all-anagrams-in-a-string-renderer';

describe('大厂面试经典题与通关课扩展 09 测试套件 (突破 600 门大关)', () => {
  // 1. 两数相除 (LeetCode 29)
  describe('大厂真题: 两数相除 (Divide Two Integers)', () => {
    it('二进制倍增位移实现快速除法', () => {
      const steps = buildDivideSteps(29, 3);
      const last = steps[steps.length - 1];
      expect(last.quotient).toBe(9);
    });

    it('异号除法与整除用例', () => {
      const steps = buildDivideSteps(10, -2);
      const last = steps[steps.length - 1];
      expect(last.quotient).toBe(-5);
    });
  });

  // 2. 下一个排列 (LeetCode 31)
  describe('大厂真题: 下一个排列 (Next Permutation)', () => {
    it('经典拐点定位与后缀反转', () => {
      const steps = buildNextPermutationSteps([1, 2, 7, 4, 3, 1]);
      const last = steps[steps.length - 1];
      expect(last.nums).toEqual([1, 3, 1, 2, 4, 7]);
    });

    it('全降序最大排列反转回到最小升序排列', () => {
      const steps = buildNextPermutationSteps([3, 2, 1]);
      const last = steps[steps.length - 1];
      expect(last.nums).toEqual([1, 2, 3]);
    });
  });

  // 3. 有效的括号字符串 (LeetCode 678)
  describe('大厂真题: 有效的括号字符串 (Valid Parenthesis String)', () => {
    it('通配符 * 可充当多重角色', () => {
      const steps1 = buildValidParenthesisStringSteps('(*)');
      expect(steps1[steps1.length - 1].isValidSoFar).toBe(true);

      const steps2 = buildValidParenthesisStringSteps('(*))');
      expect(steps2[steps2.length - 1].isValidSoFar).toBe(true);
    });

    it('右括号过多无法拯救', () => {
      const steps = buildValidParenthesisStringSteps(')(');
      expect(steps[steps.length - 1].isValidSoFar).toBe(false);
    });
  });

  // 4. 乘积小于 K 的子数组 (LeetCode 713)
  describe('大厂真题: 乘积小于 K 的子数组 (Subarray Product Less Than K)', () => {
    it('滑动窗口正整数乘积计数', () => {
      const steps = buildProductLessThanKSteps([10, 5, 2, 6], 100);
      const last = steps[steps.length - 1];
      expect(last.count).toBe(8);
    });

    it('k <= 1 边界特判', () => {
      const steps = buildProductLessThanKSteps([1, 2, 3], 0);
      const last = steps[steps.length - 1];
      expect(last.count).toBe(0);
    });
  });

  // 5. 找到字符串中所有字母异位词 (LeetCode 438)
  describe('大厂真题: 找到字符串中所有字母异位词 (Find All Anagrams in a String)', () => {
    it('定长滑动窗口与字符频次收集起始点', () => {
      const steps = buildFindAllAnagramsSteps('cbaebabacd', 'abc');
      const last = steps[steps.length - 1];
      expect(last.ans).toEqual([0, 6]);
    });
  });
});
