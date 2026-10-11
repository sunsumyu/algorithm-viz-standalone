/**
 * 替换后的最长重复字符 — 步进推演编译器
 * LeetCode 424: 滑动窗口与字符频次统计
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface CharacterReplacementStep extends StepBase {
  s: string;
  k: number;
  left: number;
  right: number;
  maxCount: number;
  counts: Record<string, number>;
  windowLen: number;
  isValid: boolean;
  phase: 'init' | 'expand' | 'shrink' | 'finish';
  bestLen: number;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const CHARACTER_REPLACEMENT_CODES = {
  java: `public class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxCount = 0, maxLen = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            count[c - 'A']++;
            maxCount = Math.max(maxCount, count[c - 'A']);
            
            // 窗口内需要替换的字符数超过 k，收缩左边界
            if (right - left + 1 - maxCount > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
  cpp: `class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> count(26, 0);
        int left = 0, maxCount = 0, maxLen = 0;
        for (int right = 0; right < s.size(); ++right) {
            count[s[right] - 'A']++;
            maxCount = max(maxCount, count[s[right] - 'A']);
            if (right - left + 1 - maxCount > k) {
                count[s[left] - 'A']--;
                left++;
            }
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
  python: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = collections.defaultdict(int)
        left = 0
        max_count = 0
        max_len = 0
        for right, c in enumerate(s):
            count[c] += 1
            max_count = max(max_count, count[c])
            if (right - left + 1) - max_count > k:
                count[s[left]] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len`,
};

export const CHARACTER_REPLACEMENT_CODE_LINES = {
  init: { java: 4, cpp: 5, python: 4 },
  expand: { java: 9, cpp: 8, python: 9 },
  shrink: { java: 13, cpp: 10, python: 11 },
  finish: { java: 18, cpp: 15, python: 14 },
};

export function buildCharacterReplacementSteps(s: string = 'AABABBA', k: number = 1): CharacterReplacementStep[] {
  const steps: CharacterReplacementStep[] = [];
  const count: Record<string, number> = {};
  let left = 0;
  let maxCount = 0;
  let maxLen = 0;

  // Step 0: Init
  steps.push({
    s,
    k,
    left: 0,
    right: 0,
    maxCount: 0,
    counts: {},
    windowLen: 0,
    isValid: true,
    phase: 'init',
    bestLen: 0,
    message: `算法启动：原字符串 "${s}"，允许最多替换 k = ${k} 个字符。初始化滑动窗口 [0 .. 0]。`,
    log: `初始化双指针滑动窗口: s="${s}", k=${k}`,
    codeLine: CHARACTER_REPLACEMENT_CODE_LINES.init,
  });

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    count[c] = (count[c] || 0) + 1;
    maxCount = Math.max(maxCount, count[c]);
    const windowLen = right - left + 1;
    const needReplace = windowLen - maxCount;
    const valid = needReplace <= k;

    steps.push({
      s,
      k,
      left,
      right,
      maxCount,
      counts: { ...count },
      windowLen,
      isValid: valid,
      phase: 'expand',
      bestLen: maxLen,
      message: `扩大窗口：引入右边界字符 s[${right}] = '${c}'。当前窗口 [${left}..${right}] 长度 ${windowLen}，主导字符最高频次 maxCount = ${maxCount}。需替换 ${needReplace} 个字符。`,
      log: `窗口扩展 [${left}..${right}]: 长度=${windowLen}, maxCount=${maxCount}, 需替换=${needReplace}`,
      codeLine: CHARACTER_REPLACEMENT_CODE_LINES.expand,
    });

    if (needReplace > k) {
      const leftChar = s[left];
      count[leftChar]--;
      steps.push({
        s,
        k,
        left,
        right,
        maxCount,
        counts: { ...count },
        windowLen,
        isValid: false,
        phase: 'shrink',
        bestLen: maxLen,
        message: `需替换字符数 ${needReplace} > k (${k})，超出上限！左边界 left 右移收缩窗口：移除 s[${left}] ('${leftChar}')，left 从 ${left} 移至 ${left + 1}。`,
        log: `收缩左边界: 移除 '${leftChar}', left=${left + 1}`,
        codeLine: CHARACTER_REPLACEMENT_CODE_LINES.shrink,
      });
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  // Finish
  steps.push({
    s,
    k,
    left,
    right: s.length - 1,
    maxCount,
    counts: { ...count },
    windowLen: maxLen,
    isValid: true,
    phase: 'finish',
    bestLen: maxLen,
    message: `滑动窗口探索完毕！至多替换 ${k} 次后能获得的最长重复字符子串长度为 ${maxLen}。`,
    log: `算法收敛完成，最大长度 maxLen=${maxLen}`,
    codeLine: CHARACTER_REPLACEMENT_CODE_LINES.finish,
  });

  return steps;
}
