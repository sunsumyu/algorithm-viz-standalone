import { describe, it, expect } from 'vitest';
import {
  buildFindAllAnagramsSteps,
  FIND_ALL_ANAGRAMS_CODES,
  AnagramsStep,
} from '../../algorithms/categories/string/find-all-anagrams-in-a-string-renderer';
import {
  buildCharacterReplacementSteps,
  CHARACTER_REPLACEMENT_CODES,
  CharacterReplacementStep,
} from '../../algorithms/categories/string/longest-repeating-character-replacement-renderer';
import {
  generateDecodeSteps,
  DECODE_039_CODES,
  DecodeStep,
} from '../../algorithms/categories/string/nested-recursion-decode-039-renderer';
import {
  buildPalindromePairsSteps,
  PALINDROME_PAIRS_CODES,
  PalindromePairsStep,
} from '../../algorithms/categories/string/palindrome-pairs-renderer';
import {
  generateMinWindowSteps,
  MIN_WINDOW_CODES,
  MinWindowStep,
} from '../../algorithms/categories/advanced-topics/hard-interview/min-window-substring-renderer';
import {
  generateRegexSteps,
  REGEX_MATCHING_CODES,
  RegexStep,
} from '../../algorithms/categories/advanced-topics/hard-interview/regex-matching-renderer';

function assertCodeLineWithinBounds(
  codeLine: any,
  codeDict: Record<string, string>,
  stepDesc: string
) {
  if (codeLine === undefined || codeLine === null) return;
  if (typeof codeLine === 'number') {
    for (const [lang, code] of Object.entries(codeDict)) {
      const lineCount = code.trim().split('\n').length;
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1`
      ).toBeGreaterThanOrEqual(1);
    }
  } else if (typeof codeLine === 'object' && !Array.isArray(codeLine)) {
    for (const [lang, lineVal] of Object.entries(codeLine)) {
      if (codeDict[lang] !== undefined) {
        const lineCount = codeDict[lang].trim().split('\n').length;
        const linesToCheck = Array.isArray(lineVal) ? lineVal : [lineVal];
        for (const line of linesToCheck) {
          if (typeof line === 'number') {
            expect(
              line,
              `${stepDesc}: ${lang} line ${line} exceeds total lines ${lineCount}`
            ).toBeLessThanOrEqual(lineCount);
            expect(
              line,
              `${stepDesc}: ${lang} line ${line} must be >= 1`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  }
}

describe('String Advanced Stage Invariants Gatekeeper (高阶字符串与硬核真题门禁矩阵)', () => {
  // 1. LeetCode 438: Find All Anagrams in a String
  describe('1. Find All Anagrams (LeetCode 438 · 找到字符串中所有字母异位词)', () => {
    it('s="cbaebabacd", p="abc" 应精准定位起始索引 [0, 6] 且满足滑窗不变量', () => {
      const steps = buildFindAllAnagramsSteps('cbaebabacd', 'abc');
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.phase).toBe('init');
      expect(step0.ans).toEqual([]);
      expect(step0.s).toBe('cbaebabacd');
      expect(step0.p).toBe('abc');

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, FIND_ALL_ANAGRAMS_CODES, `FindAllAnagrams Step ${i}`);
        if (s.phase === 'slide' || s.phase === 'match-collected') {
          expect(s.left).toBeGreaterThanOrEqual(0);
          expect(s.right).toBeGreaterThanOrEqual(s.left);
          expect(s.right).toBeLessThan('cbaebabacd'.length);
        }
      }

      const finalStep = steps[steps.length - 1];
      expect(finalStep.phase).toBe('finish');
      expect(finalStep.ans).toEqual([0, 6]);
    });

    it('s 长度小于 p 长度时应立即优雅收敛返回空列表', () => {
      const steps = buildFindAllAnagramsSteps('ab', 'abc');
      expect(steps.length).toBe(1);
      expect(steps[0].phase).toBe('finish');
      expect(steps[0].ans).toEqual([]);
      assertCodeLineWithinBounds(steps[0].codeLine, FIND_ALL_ANAGRAMS_CODES, 'FindAllAnagrams Short Edge');
    });
  });

  // 2. LeetCode 424: Longest Repeating Character Replacement
  describe('2. Longest Repeating Character Replacement (LeetCode 424 · 替换后的最长重复字符)', () => {
    it('s="AABABBA", k=1 应正确追踪窗口扩展与收缩，收敛最大长度 4', () => {
      const steps = buildCharacterReplacementSteps('AABABBA', 1);
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.phase).toBe('init');
      expect(step0.bestLen).toBe(0);
      expect(step0.left).toBe(0);
      expect(step0.right).toBe(0);

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, CHARACTER_REPLACEMENT_CODES, `CharacterReplacement Step ${i}`);
        if (s.phase === 'expand') {
          expect(s.windowLen).toBe(s.right - s.left + 1);
          expect(s.maxCount).toBeGreaterThan(0);
        }
      }

      const finalStep = steps[steps.length - 1];
      expect(finalStep.phase).toBe('finish');
      expect(finalStep.bestLen).toBe(4);
    });

    it('单字符全纯净串 "AAAA", k=2 应收敛为 4 且无收缩阶段', () => {
      const steps = buildCharacterReplacementSteps('AAAA', 2);
      const shrinkSteps = steps.filter(s => s.phase === 'shrink');
      expect(shrinkSteps.length).toBe(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.bestLen).toBe(4);
    });
  });

  // 3. LeetCode 394 / Class 039: Nested Recursion Decode String
  describe('3. Nested Recursion Decode String (LeetCode 394 / Class 039 · 嵌套递归字符串解码)', () => {
    it('输入 "3[a2[c]]" 应通过嵌套递归层级正确展开为 "accaccacc"', () => {
      const steps = generateDecodeSteps('3[a2[c]]');
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.depth).toBe(0);
      expect(step0.charIndex).toBe(0);

      let maxDepth = 0;
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, DECODE_039_CODES, `DecodeStep ${i}`);
        expect(s.depth).toBeGreaterThanOrEqual(0);
        maxDepth = Math.max(maxDepth, s.depth);
      }

      // 验证深层嵌套确实深入到了至少 2 层
      expect(maxDepth).toBeGreaterThanOrEqual(2);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.decodedResult).toBe('accaccacc');
    });

    it('输入无括号普通字符串 "abc" 应在 depth=0 闭合', () => {
      const steps = generateDecodeSteps('abc');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.decodedResult).toBe('abc');
    });
  });

  // 4. LeetCode 336: Palindrome Pairs
  describe('4. Palindrome Pairs (LeetCode 336 · 回文对)', () => {
    it('输入 ["abcd","dcba","lls","s","sssll"] 应找出所有回文对且每对前后拼接构成回文', () => {
      const words = ['abcd', 'dcba', 'lls', 's', 'sssll'];
      const steps = buildPalindromePairsSteps(words);
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.currentWordIndex).toBe(-1);
      expect(step0.foundPairs).toEqual([]);

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, PALINDROME_PAIRS_CODES, `PalindromePairs Step ${i}`);
      }

      const finalStep = steps[steps.length - 1];
      const pairs = finalStep.foundPairs;
      expect(pairs.length).toBeGreaterThan(0);

      // 验证数学不变量：每个找到的 pair [i, j]，words[i] + words[j] 必须是真回文！
      for (const [i, j] of pairs) {
        expect(i).not.toBe(j);
        const combined = words[i] + words[j];
        const reversed = combined.split('').reverse().join('');
        expect(combined).toBe(reversed);
      }
    });
  });

  // 5. LeetCode 76: Minimum Window Substring
  describe('5. Minimum Window Substring (LeetCode 76 · 最小覆盖子串)', () => {
    it('s="ADOBECODEBANC", t="ABC" 应正确追踪欠账模型并收敛到 "BANC"', () => {
      const steps = generateMinWindowSteps('ADOBECODEBANC', 'ABC');
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.allDebt).toBe(3);
      expect(step0.bestLen).toBe(0);

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, MIN_WINDOW_CODES, `MinWindow Step ${i}`);
        expect(s.allDebt).toBeGreaterThanOrEqual(0);
        if (s.r >= 0) {
          expect(s.l).toBeGreaterThanOrEqual(0);
          expect(s.l).toBeLessThanOrEqual(s.r + 1);
        }
      }

      const finalStep = steps[steps.length - 1];
      expect(finalStep.bestSubstr).toBe('BANC');
      expect(finalStep.bestLen).toBe(4);
    });

    it('无解情况 s="a", t="aa" 最终子串应收敛为空串 ""', () => {
      const steps = generateMinWindowSteps('a', 'aa');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.bestSubstr).toBe('');
      expect(finalStep.bestLen).toBe(0);
    });
  });

  // 6. LeetCode 10: Regular Expression Matching
  describe('6. Regular Expression Matching (LeetCode 10 · 正则表达式匹配)', () => {
    it('s="aab", p="c*a*b" 应成功匹配 (true) 且 DP 状态空间维度正确', () => {
      const steps = generateRegexSteps('aab', 'c*a*b');
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 Entry Contract
      const step0 = steps[0];
      expect(step0.dp.length).toBe('aab'.length + 1);
      expect(step0.dp[0].length).toBe('c*a*b'.length + 1);
      expect(step0.dp[0][0]).toBe(true);

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        assertCodeLineWithinBounds(s.codeLine, REGEX_MATCHING_CODES, `RegexStep ${i}`);
      }

      const finalStep = steps[steps.length - 1];
      expect(finalStep.matched).toBe(true);
      expect(finalStep.dp['aab'.length]['c*a*b'.length]).toBe(true);
    });

    it('s="mississippi", p="mis*is*p*." 匹配失败 (false)', () => {
      const steps = generateRegexSteps('mississippi', 'mis*is*p*.');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.matched).toBe(false);
    });
  });
});
