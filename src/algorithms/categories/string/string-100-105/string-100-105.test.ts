/**
 * 左神算法通关课 Class 100 ~ 105 高阶字符串专题全量自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildKmpSteps, computeNextArray } from './kmp-renderer';
import { buildKmpPeriodSteps } from './kmp-period-renderer';
import { buildACAutomatonSteps } from './ac-automaton-renderer';
import { buildManacherSteps } from './manacher-renderer';
import { buildZAlgorithmSteps } from './z-algorithm-renderer';
import { buildStringHashSteps } from './string-hash-renderer';
import {
  KMP_CODES,
  KMP_PERIOD_CODES,
  AC_AUTOMATON_CODES,
  MANACHER_CODES,
  Z_ALGORITHM_CODES,
  STRING_HASH_CODES,
} from './string-100-105-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(line, `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神进阶字符串专题 (Class 100 ~ 105) 综合测试套件', () => {
  // 1. Class 100: KMP
  describe('Class 100: KMP 算法核心原理', () => {
    it('应正确计算 next 数组最长公共前后缀', () => {
      const next = computeNextArray('ABABC');
      expect(next).toEqual([-1, 0, 0, 1, 2]);
    });

    it('应成功在主串中匹配出目标模式串下标并满足 1-based 行号约束', () => {
      const steps = buildKmpSteps('ABABABCABA', 'ABABC');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.foundIndex).toBe(2);
      verify1BasedCodeLines(steps, KMP_CODES);
    });

    it('未找到时应正确返回 -1', () => {
      const steps = buildKmpSteps('AAAAAA', 'B');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.foundIndex).toBe(-1);
    });
  });

  // 2. Class 101: KMP Period
  describe('Class 101: KMP 循环节与周期串检测', () => {
    it('完美周期串应正确识别最小周期与重复次数', () => {
      const steps = buildKmpPeriodSteps('abcabcabc');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isDivisible).toBe(true);
      expect(lastStep.periodLen).toBe(3);
      expect(lastStep.repeatCount).toBe(3);
      verify1BasedCodeLines(steps, KMP_PERIOD_CODES);
    });

    it('无真周期串应回退到自身长度', () => {
      const steps = buildKmpPeriodSteps('abcab');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.isDivisible).toBe(false);
      expect(lastStep.periodLen).toBe(3);
    });
  });

  // 3. Class 102: AC Automaton
  describe('Class 102: AC 自动机多模式串匹配', () => {
    it('单次扫描应正确捕获全部命中模式串', () => {
      const text = 'abcefabcd';
      const patterns = ['ab', 'bc', 'abcd', 'ef'];
      const steps = buildACAutomatonSteps(text, patterns);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.matchedCount).toBe(4);
      expect(lastStep.matchedList).toContain('ab');
      expect(lastStep.matchedList).toContain('bc');
      expect(lastStep.matchedList).toContain('ef');
      expect(lastStep.matchedList).toContain('abcd');
      verify1BasedCodeLines(steps, AC_AUTOMATON_CODES);
    });
  });

  // 4. Class 103: Manacher
  describe('Class 103: Manacher 最长回文子串', () => {
    it('奇偶长度回文串均应正确提取最长长度', () => {
      const steps1 = buildManacherSteps('babad');
      expect(steps1[steps1.length - 1].maxLen).toBe(3);
      verify1BasedCodeLines(steps1, MANACHER_CODES);

      const steps2 = buildManacherSteps('cbbd');
      expect(steps2[steps2.length - 1].maxLen).toBe(2);

      const steps3 = buildManacherSteps('abacaba');
      expect(steps3[steps3.length - 1].maxLen).toBe(7);
      expect(steps3[steps3.length - 1].longestPalindrome).toBe('abacaba');
    });
  });

  // 5. Class 104: Z-Algorithm
  describe('Class 104: 扩展 KMP / Z 算法', () => {
    it('应正确生成 Z 匹配盒与 LCP 数组', () => {
      const steps = buildZAlgorithmSteps('abacaba');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.zArr).toEqual([7, 0, 1, 0, 3, 0, 1]);
      verify1BasedCodeLines(steps, Z_ALGORITHM_CODES);
    });
  });

  // 6. Class 105: String Hash
  describe('Class 105: 字符串哈希与滚动哈希', () => {
    it('相同子串哈希应完全一致，不同子串哈希不一致', () => {
      // 'abcdeabcf': s[0..2] = 'abc', s[5..7] = 'abc', s[1..3] = 'bcd'
      const stepsIdentical = buildStringHashSteps('abcdeabcf', 0, 2, 5, 7);
      expect(stepsIdentical[stepsIdentical.length - 1].isEqual).toBe(true);
      verify1BasedCodeLines(stepsIdentical, STRING_HASH_CODES);

      const stepsDiff = buildStringHashSteps('abcdeabcf', 0, 2, 1, 3);
      expect(stepsDiff[stepsDiff.length - 1].isEqual).toBe(false);
    });
  });
});
