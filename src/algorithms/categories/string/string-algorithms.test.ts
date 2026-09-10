import { describe, it, expect } from 'vitest';
import { buildReverseStringSteps } from './reverse-string-renderer';
import { buildReverseStringIISteps } from './reverse-string-ii-renderer';
import { buildReplaceDigitsSteps } from './replace-digits-renderer';
import { buildReverseWordsSteps } from './reverse-words-renderer';
import { buildRightRotateSteps } from './right-rotate-string-renderer';
import { buildSSSteps } from './implement-str-str-renderer';
import { buildRPSSteps } from './repeated-substring-renderer';
import { buildLCPSteps } from './longest-common-prefix-renderer';

describe('String Category Modernized Algorithms (字符串全套核心算法推导测试)', () => {
  describe('1. Reverse String (LeetCode 344 · 反转字符串)', () => {
    it('"hello" 原地反转为 "olleh"', () => {
      const steps = buildReverseStringSteps('hello');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.s.join('')).toBe('olleh');
      expect(lastStep.swapCount).toBe(2);
    });

    it('"Hannah" 原地反转为 "hannaH"', () => {
      const steps = buildReverseStringSteps('Hannah');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.s.join('')).toBe('hannaH');
    });
  });

  describe('2. Reverse String II (LeetCode 541 · 反转字符串 II)', () => {
    it('s="abcdefg", k=2 分段反转为 "bacdfeg"', () => {
      const steps = buildReverseStringIISteps('abcdefg', 2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.s.join('')).toBe('bacdfeg');
    });

    it('s="abcd", k=2 分段反转为 "bacd"', () => {
      const steps = buildReverseStringIISteps('abcd', 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.s.join('')).toBe('bacd');
    });
  });

  describe('3. Replace Digits (KamaCoder 54 · 替换数字)', () => {
    it('s="a1b2c" 替换为 "anumberbnumberc"', () => {
      const steps = buildReplaceDigitsSteps('a1b2c');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.chars.join('')).toBe('anumberbnumberc');
    });

    it('s="123" 替换为 "numbernumbernumber"', () => {
      const steps = buildReplaceDigitsSteps('123');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.chars.join('')).toBe('numbernumbernumber');
    });
  });

  describe('4. Reverse Words in a String (LeetCode 151 · 翻转字符串里的单词)', () => {
    it('s="the sky is blue" 翻转为 "blue is sky the"', () => {
      const steps = buildReverseWordsSteps('the sky is blue');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.chars.join('')).toBe('blue is sky the');
    });

    it('s="  hello world  " 去除多余空格并翻转为 "world hello"', () => {
      const steps = buildReverseWordsSteps('  hello world  ');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.chars.join('')).toBe('world hello');
    });
  });

  describe('5. Right Rotate String (KamaCoder 55 · 右旋转字符串)', () => {
    it('s="abcdefg", k=2 三次反转后为 "fgabcde"', () => {
      const steps = buildRightRotateSteps('abcdefg', 2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.chars.join('')).toBe('fgabcde');
    });

    it('s="lrloseumgh", k=6 右旋后为 "seumghlrlo"', () => {
      const steps = buildRightRotateSteps('lrloseumgh', 6);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.chars.join('')).toBe('seumghlrlo');
    });
  });

  describe('6. Implement strStr() (LeetCode 28 · KMP 字符串匹配)', () => {
    it('在 "hello" 中匹配 "ll"，成功匹配在索引 2', () => {
      const steps = buildSSSteps('hello', 'll');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.matchedIndex).toBe(2);
    });

    it('在 "aaaaa" 中匹配 "bba"，未找到匹配 (not-found)', () => {
      const steps = buildSSSteps('aaaaa', 'bba');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('not-found');
    });

    it('needle 为空串时返回索引 0', () => {
      const steps = buildSSSteps('any', '');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.matchedIndex).toBe(0);
    });
  });

  describe('7. Repeated Substring Pattern (LeetCode 459 · 重复的子字符串)', () => {
    it('"abab" 由 "ab" 重复构成，返回 found', () => {
      const steps = buildRPSSteps('abab');
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.patternLen).toBe(2);
    });

    it('"aba" 不是重复子串，返回 not-found', () => {
      const steps = buildRPSSteps('aba');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('not-found');
    });

    it('"abcabcabcabc" 由 "abc" 构成，周期长度为 3', () => {
      const steps = buildRPSSteps('abcabcabcabc');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('found');
      expect(lastStep.patternLen).toBe(3);
    });
  });

  describe('8. Longest Common Prefix (LeetCode 14 · 最长公共前缀)', () => {
    it('["flower","flow","flight"] 找到最长公共前缀 "fl"', () => {
      const steps = buildLCPSteps(['flower', 'flow', 'flight']);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.prefix).toBe('fl');
    });

    it('["dog","racecar","car"] 无公共前缀，返回 ""', () => {
      const steps = buildLCPSteps(['dog', 'racecar', 'car']);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.prefix).toBe('');
    });
  });
});
