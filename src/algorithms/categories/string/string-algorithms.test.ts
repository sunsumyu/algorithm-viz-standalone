import { describe, it, expect } from 'vitest';
import { buildSSSteps } from './implement-str-str-renderer';
import { buildRPSSteps } from './repeated-substring-renderer';

describe('String Algorithms Step Generation (字符串核心算法推导测试)', () => {
  describe('Implement strStr() (KMP 字符串匹配 LeetCode 28)', () => {
    it('1. 在 "hello" 中匹配 "ll"，成功匹配在索引 2', () => {
      const steps = buildSSSteps('hello', 'll');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.i - lastStep.j).toBe(2);
      expect(lastStep.message).toContain('返回 2');
    });

    it('2. 在 "aaaaa" 中匹配 "bba"，未找到匹配 (not-found)', () => {
      const steps = buildSSSteps('aaaaa', 'bba');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('not-found');
    });

    it('3. needle 为空串时返回索引 0', () => {
      const steps = buildSSSteps('any', '');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
    });
  });

  describe('Repeated Substring Pattern (重复的子字符串 LeetCode 459)', () => {
    it('4. "abab" 由 "ab" 重复构成，返回 found', () => {
      const steps = buildRPSSteps('abab');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.patternLen).toBe(2);
    });

    it('5. "aba" 不是重复子串，返回 not-found', () => {
      const steps = buildRPSSteps('aba');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('not-found');
    });

    it('6. "abcabcabcabc" 由 "abc" 或 "abcabc" 构成，长度 3 时即命中', () => {
      const steps = buildRPSSteps('abcabcabcabc');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.patternLen).toBe(3);
    });
  });
});
