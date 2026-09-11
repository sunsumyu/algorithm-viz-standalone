/**
 * 找到字符串中所有字母异位词 (Find All Anagrams in a String)
 * LeetCode 438 (Medium / 大厂高频定长滑动窗口与哈希差值)
 * 核心原语:
 *  给定两个字符串 s 和 p，找到 s 中所有 p 的异位词的子串，返回这些子串的起始索引。
 *  定长滑动窗口优化：
 *   窗口固定大小等于 p.length()。
 *   统计 p 的 26 字母频次 pCount，与当前窗口内 s 的频次 sCount。
 *   右边界移入字符 s[right]，若窗口超出长度则左边界移出 s[left]。
 *   当两个频次表完全一致（或差值计数 diff === 0）时，收集当前 left 下标！
 *  时间复杂度 O(N)，空间复杂度 O(26) = O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

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
  codeLine: number;
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
      codeLine: 4,
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
    codeLine: 7,
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
          codeLine: 16,
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
          codeLine: 14,
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
    codeLine: 18,
  });

  return steps;
}

function renderFindAllAnagramsCanvas(step: AnagramsStep): string {
  const { s, p, left, right, isMatch, ans, phase } = step;

  const charCards = s
    .split('')
    .map((c, idx) => {
      const inWin = idx >= left && idx <= right && phase !== 'finish';
      const isStart = idx === left && isMatch;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (inWin) {
        if (isMatch) {
          bg = 'rgba(16, 185, 129, 0.25)';
          border = '2px solid #10b981';
          color = '#34d399';
        } else {
          bg = 'rgba(56, 189, 248, 0.2)';
          border = '2px solid #38bdf8';
          color = '#bae6fd';
        }
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 36px; margin: 0 3px;">
        <div style="font-size: 10px; height: 14px; margin-bottom: 2px;">
          ${isStart ? '<span style="color:#10b981;font-weight:700;">★</span>' : ''}
        </div>
        <div style="
          width: 100%;
          height: 38px;
          background: ${bg};
          border: ${border};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
          transition: all 0.2s;
        ">${c}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">定长滑动窗口 (长度 ${p.length}) 追踪</div>
          <div style="font-size: 11px; color: ${isMatch ? '#34d399' : '#38bdf8'}; font-weight: 700;">
            ${isMatch ? '✓ 匹配成功！异位词命中' : '比对中...'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 65px; overflow-x: auto;">
          ${charCards}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标模式串 p</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">"${p}"</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口截取</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">
            "${left >= 0 && right < s.length ? s.slice(left, right + 1) : '—'}"
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">是否字母异位词</div>
          <div style="font-size: 16px; font-weight: 700; color: ${isMatch ? '#34d399' : '#94a3b8'};">
            ${isMatch ? '✓ 是' : '否'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">已命中起始下标列表</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">[${ans.join(', ')}]</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'find-all-anagrams-in-a-string',
  name: '找到字符串中所有字母异位词',
  category: 'string',
  difficulty: 2,
  learningGoal: 'LeetCode 438: 寻找模式串的所有异位词子串起始位置。基于固定长度滑动窗口与 26 字母频次数组差值，O(N) 线性收集所有匹配点。',
  codeLanguages: FIND_ALL_ANAGRAMS_CODES,
  generateSteps: (inputs) => {
    const rawS = inputs?.s as string | undefined;
    const rawP = inputs?.p as string | undefined;
    const s = typeof rawS === 'string' && rawS.trim().length > 0 ? rawS.trim() : 'cbaebabacd';
    const p = typeof rawP === 'string' && rawP.trim().length > 0 ? rawP.trim() : 'abc';
    return buildFindAllAnagramsSteps(s, p);
  },
  renderCanvas: (container: HTMLElement, step: AnagramsStep) => {
    container.innerHTML = renderFindAllAnagramsCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '输入源字符串',
      type: 'text',
      defaultValue: 'cbaebabacd',
      placeholder: '例如: cbaebabacd',
    },
    {
      id: 'p',
      label: '目标异位模式串',
      type: 'text',
      defaultValue: 'abc',
      placeholder: '例如: abc',
    },
  ],
});
