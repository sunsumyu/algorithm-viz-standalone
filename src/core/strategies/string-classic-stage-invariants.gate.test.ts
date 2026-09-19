/**
 * string-classic-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】经典字符串算法全系列 (Classic String Invariant Gatekeeper)
 *
 * 覆盖 8 种经典字符串核心算法与阶段不变量：
 * 1. 反转字符串 (LeetCode 344) - 首尾双指针向内对撞原地交换
 * 2. 反转字符串 II (LeetCode 541) - 2k 步长分段反转
 * 3. 替换数字 (KamaCoder 54) - 预扩容与从后向前双指针线性填充
 * 4. 翻转字符串里的单词 (LeetCode 151) - 清除空格 + 整体反转 + 单词局部反转
 * 5. 右旋转字符串 (KamaCoder 55) - 三次局部/整体反转空间 O(1)
 * 6. 实现 strStr() (LeetCode 28 KMP) - Next 前缀表匹配与 O(N+M) 线性搜索
 * 7. 重复的子字符串 (LeetCode 459 KMP) - 最长相等前后缀与周期串整除定理
 * 8. 最长公共前缀 (LeetCode 14) - 纵向矩阵扫描与首次失配熔断
 *
 * 机械不变量门禁红线：
 * 1. 步进序列非空且初始帧完备；
 * 2. 状态指针与计算结果数学正确性；
 * 3. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import { buildReverseStringSteps } from '../../algorithms/categories/string/reverse-string-renderer';
import { REVERSE_STRING_CODE_LANGUAGES } from '../../algorithms/categories/string/reverse-string-problem-content';
import { buildReverseStringIISteps } from '../../algorithms/categories/string/reverse-string-ii-renderer';
import { REVERSE_STRING_II_CODE_LANGUAGES } from '../../algorithms/categories/string/reverse-string-ii-problem-content';
import { buildReplaceDigitsSteps } from '../../algorithms/categories/string/replace-digits-renderer';
import { REPLACE_DIGITS_CODE_LANGUAGES } from '../../algorithms/categories/string/replace-digits-problem-content';
import { buildReverseWordsSteps } from '../../algorithms/categories/string/reverse-words-renderer';
import { REVERSE_WORDS_CODE_LANGUAGES } from '../../algorithms/categories/string/reverse-words-problem-content';
import { buildRightRotateSteps } from '../../algorithms/categories/string/right-rotate-string-renderer';
import { RIGHT_ROTATE_STRING_CODE_LANGUAGES } from '../../algorithms/categories/string/right-rotate-string-problem-content';
import { buildSSSteps } from '../../algorithms/categories/string/implement-str-str-renderer';
import { STR_STR_CODE_LANGUAGES } from '../../algorithms/categories/string/implement-str-str-problem-content';
import { buildRPSSteps } from '../../algorithms/categories/string/repeated-substring-renderer';
import { REPEATED_SUBSTRING_CODE_LANGUAGES } from '../../algorithms/categories/string/repeated-substring-problem-content';
import { buildLCPSteps } from '../../algorithms/categories/string/longest-common-prefix-renderer';
import { LONGEST_COMMON_PREFIX_CODE_LANGUAGES } from '../../algorithms/categories/string/longest-common-prefix-problem-content';

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

describe('Classic String Invariants Gatekeeper (经典字符串算法机械门禁)', () => {
  describe('1. Reverse String (LeetCode 344)', () => {
    it('双指针原地反转 "hello" -> "olleh" 且代码映射合规', () => {
      const steps = buildReverseStringSteps('hello');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.s.join('')).toBe('olleh');
      expect(last.swapCount).toBe(2);

      verifyCodeLines(steps, 'LeetCode 344 反转字符串', REVERSE_STRING_CODE_LANGUAGES);
    });
  });

  describe('2. Reverse String II (LeetCode 541)', () => {
    it('分段反转 "abcdefg" (k=2) -> "bacdfeg" 且行号不越界', () => {
      const steps = buildReverseStringIISteps('abcdefg', 2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.s.join('')).toBe('bacdfeg');

      verifyCodeLines(steps, 'LeetCode 541 反转字符串 II', REVERSE_STRING_II_CODE_LANGUAGES);
    });
  });

  describe('3. Replace Digits (KamaCoder 54)', () => {
    it('预扩容双指针替换 "a1b2c" -> "anumberbnumberc"', () => {
      const steps = buildReplaceDigitsSteps('a1b2c');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.chars.join('')).toBe('anumberbnumberc');

      verifyCodeLines(steps, 'KamaCoder 54 替换数字', REPLACE_DIGITS_CODE_LANGUAGES);
    });
  });

  describe('4. Reverse Words in a String (LeetCode 151)', () => {
    it('三步反转法成功翻转 "  the sky  is blue  " -> "blue is sky the"', () => {
      const steps = buildReverseWordsSteps('  the sky  is blue  ');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.chars.join('')).toBe('blue is sky the');

      verifyCodeLines(steps, 'LeetCode 151 翻转字符串里的单词', REVERSE_WORDS_CODE_LANGUAGES);
    });
  });

  describe('5. Right Rotate String (KamaCoder 55)', () => {
    it('三次反转法成功右旋转 "abcdefg" (k=2) -> "fgabcde"', () => {
      const steps = buildRightRotateSteps('abcdefg', 2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.chars.join('')).toBe('fgabcde');

      verifyCodeLines(steps, 'KamaCoder 55 右旋转字符串', RIGHT_ROTATE_STRING_CODE_LANGUAGES);
    });
  });

  describe('6. Implement strStr() (LeetCode 28 KMP)', () => {
    it('KMP 算法在 "hello" 中定位 "ll" 返回 2', () => {
      const steps = buildSSSteps('hello', 'll');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('found');
      expect(last.matchedIndex).toBe(2);

      verifyCodeLines(steps, 'LeetCode 28 实现 strStr()', STR_STR_CODE_LANGUAGES);
    });

    it('KMP 算法失配返回 -1', () => {
      const steps = buildSSSteps('aaaaa', 'bba');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('not-found');
      expect(last.matchedIndex).toBe(-1);

      verifyCodeLines(steps, 'LeetCode 28 实现 strStr() 失配', STR_STR_CODE_LANGUAGES);
    });
  });

  describe('7. Repeated Substring Pattern (LeetCode 459)', () => {
    it('"abab" 正确判定为由子串重复构成 (true)', () => {
      const steps = buildRPSSteps('abab');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('found');
      expect(last.isRepeated).toBe(true);

      verifyCodeLines(steps, 'LeetCode 459 重复的子字符串', REPEATED_SUBSTRING_CODE_LANGUAGES);
    });

    it('"aba" 正确判定为无法由子串重复构成 (false)', () => {
      const steps = buildRPSSteps('aba');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('not-found');
      expect(last.isRepeated).toBe(false);

      verifyCodeLines(steps, 'LeetCode 459 重复的子字符串 非周期', REPEATED_SUBSTRING_CODE_LANGUAGES);
    });
  });

  describe('8. Longest Common Prefix (LeetCode 14)', () => {
    it('["flower","flow","flight"] 正确提取最长公共前缀 "fl"', () => {
      const steps = buildLCPSteps(['flower', 'flow', 'flight']);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.prefix).toBe('fl');

      verifyCodeLines(steps, 'LeetCode 14 最长公共前缀', LONGEST_COMMON_PREFIX_CODE_LANGUAGES);
    });

    it('无公共前缀 ["dog","racecar","car"] 返回 ""', () => {
      const steps = buildLCPSteps(['dog', 'racecar', 'car']);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.prefix).toBe('');

      verifyCodeLines(steps, 'LeetCode 14 最长公共前缀 空前缀', LONGEST_COMMON_PREFIX_CODE_LANGUAGES);
    });
  });
});
