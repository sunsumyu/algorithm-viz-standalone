/**
 * 找到字符串中所有字母异位词 — 步进推演编译器
 * LeetCode 438: 定长滑动窗口与字符计数
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface AnagramsStep extends StepBase {
  s: string;
  p: string;
  left: number;
  right: number;
  isMatch: boolean;
  ans: number[];
  phase: 'init' | 'slide' | 'match-collected' | 'finish';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const FIND_ALL_ANAGRAMS_CODES = {
  java: `public class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> ans = new ArrayList<>();
        if (s.length() < p.length()) return ans;
        int[] pCount = new int[26];
        int[] sCount = new int[26];
        for (char c : p.toCharArray()) pCount[c - 'a']++;
        
        for (int right = 0; right < s.length(); right++) {
            sCount[s.charAt(right) - 'a']++;
            int left = right - p.length() + 1;
            if (left > 0) {
                sCount[s.charAt(left - 1) - 'a']--;
            }
            if (left >= 0 && Arrays.equals(sCount, pCount)) {
                ans.add(left);
            }
        }
        return ans;
    }
}`,
  cpp: `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> ans;
        if (s.size() < p.size()) return ans;
        vector<int> pCount(26, 0), sCount(26, 0);
        for (char c : p) pCount[c - 'a']++;
        for (int right = 0; right < s.size(); ++right) {
            sCount[s[right] - 'a']++;
            int left = right - (int)p.size() + 1;
            if (left > 0) sCount[s[left - 1] - 'a']--;
            if (left >= 0 && sCount == pCount) ans.push_back(left);
        }
        return ans;
    }
};`,
  python: `class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        if len(s) < len(p): return []
        p_count = collections.Counter(p)
        s_count = collections.Counter()
        ans = []
        for right, c in enumerate(s):
            s_count[c] += 1
            left = right - len(p) + 1
            if left > 0:
                s_count[s[left - 1]] -= 1
                if s_count[s[left - 1]] == 0:
                    del s_count[s[left - 1]]
            if left >= 0 and s_count == p_count:
                ans.append(left)
        return ans`,
};

export const FIND_ALL_ANAGRAMS_CODE_LINES = {
  shortLength: { java: 4, cpp: 5, python: 3 },
  init: { java: 7, cpp: 7, python: 4 },
  slide: { java: 12, cpp: 10, python: 9 },
  matchCollected: { java: 16, cpp: 12, python: 15 },
  finish: { java: 19, cpp: 14, python: 16 },
};

export function buildFindAllAnagramsSteps(s: string = 'cbaebabacd', p: string = 'abc'): AnagramsStep[] {
  const steps: AnagramsStep[] = [];
  const ans: number[] = [];

  if (s.length < p.length) {
    steps.push({
      s,
      p,
      left: 0,
      right: 0,
      isMatch: false,
      ans: [],
      phase: 'finish',
      message: `s 长度 (${s.length}) 小于 p 长度 (${p.length})，不可能存在异位词，直接返回空列表。`,
      log: `长度不足直接返回空`,
      codeLine: FIND_ALL_ANAGRAMS_CODE_LINES.shortLength,
    });
    return steps;
  }

  const pCount = new Array(26).fill(0);
  const sCount = new Array(26).fill(0);
  for (let i = 0; i < p.length; i++) {
    pCount[p.charCodeAt(i) - 97]++;
  }

  // Step 0: Init
  steps.push({
    s,
    p,
    left: 0,
    right: 0,
    isMatch: false,
    ans: [],
    phase: 'init',
    message: `算法启动：在主串 "${s}" 中寻找模式串 "${p}" 的所有异位词。设定定长滑动窗口大小为 ${p.length}。`,
    log: `初始化定长滑动窗口，目标="${p}"`,
    codeLine: FIND_ALL_ANAGRAMS_CODE_LINES.init,
  });

  const equalsCount = () => {
    for (let i = 0; i < 26; i++) {
      if (sCount[i] !== pCount[i]) return false;
    }
    return true;
  };

  for (let right = 0; right < s.length; right++) {
    sCount[s.charCodeAt(right) - 97]++;
    const left = right - p.length + 1;

    if (left > 0) {
      sCount[s.charCodeAt(left - 1) - 97]--;
    }

    if (left >= 0) {
      const match = equalsCount();
      if (match) {
        ans.push(left);
        steps.push({
          s,
          p,
          left,
          right,
          isMatch: true,
          ans: [...ans],
          phase: 'match-collected',
          message: `🎯 命中异位词！窗口 [${left} .. ${right}] ("${s.slice(left, right + 1)}") 字符频次与 "${p}" 完全匹配！收集起始索引 ${left}。`,
          log: `命中异位词起始点 index=${left}`,
          codeLine: FIND_ALL_ANAGRAMS_CODE_LINES.matchCollected,
        });
      } else {
        steps.push({
          s,
          p,
          left,
          right,
          isMatch: false,
          ans: [...ans],
          phase: 'slide',
          message: `滑窗比对：当前窗口 [${left} .. ${right}] ("${s.slice(left, right + 1)}") 字符频次与 "${p}" 不一致。`,
          log: `滑窗 [${left}..${right}] 不匹配`,
          codeLine: FIND_ALL_ANAGRAMS_CODE_LINES.slide,
        });
      }
    }
  }

  // Finish
  steps.push({
    s,
    p,
    left: s.length - p.length,
    right: s.length - 1,
    isMatch: false,
    ans: [...ans],
    phase: 'finish',
    message: `全字符串扫描完毕！"${s}" 中所有 "${p}" 的异位词起始索引为：[${ans.join(', ')}]。`,
    log: `算法收敛，收集完成: [${ans.join(', ')}]`,
    codeLine: FIND_ALL_ANAGRAMS_CODE_LINES.finish,
  });

  return steps;
}
