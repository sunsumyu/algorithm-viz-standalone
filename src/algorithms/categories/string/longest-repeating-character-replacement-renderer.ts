/**
 * 替换后的最长重复字符 (Longest Repeating Character Replacement)
 * LeetCode 424 (Medium / 大厂高频滑动窗口经典)
 * 核心原语:
 *  给你一个字符串 s 和一个整数 k。你可以选择将任意位置的字符替换为任何其他字符，最多可替换 k 次。
 *  返回在执行上述操作后，包含相同字母的最长子字符串的长度。
 *  滑动窗口精髓：
 *   维护窗口 [left .. right]，统计窗口内出现频次最高的字符频次 maxCount。
 *   窗口长度为 (right - left + 1)。
 *   若需要替换的非高频字符数 (窗口长度 - maxCount) > k，则当前窗口非法，将 left 右移一步缩小窗口。
 *   窗口大小单调不减，最终窗口长度即为最大长度！
 *  时间复杂度 O(N)，空间复杂度 O(26) = O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

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
  codeLine: number;
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
    codeLine: 4,
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
      codeLine: 8,
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
        codeLine: 12,
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
    codeLine: 16,
  });

  return steps;
}

function renderCharacterReplacementCanvas(step: CharacterReplacementStep): string {
  const { s, k, left, right, maxCount, counts, windowLen, isValid, phase, bestLen } = step;

  // 渲染字符方块与窗口指示
  const charCards = s
    .split('')
    .map((ch, idx) => {
      const inWindow = idx >= left && idx <= right && phase !== 'finish';
      const isL = idx === left && phase !== 'finish';
      const isR = idx === right && phase !== 'finish';

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (inWindow) {
        if (!isValid) {
          bg = 'rgba(239, 68, 68, 0.2)';
          border = '1px solid #ef4444';
          color = '#fca5a5';
        } else {
          bg = 'rgba(56, 189, 248, 0.25)';
          border = '2px solid #38bdf8';
          color = '#bae6fd';
        }
      }

      let pointerTag = '';
      if (isL && isR) {
        pointerTag = '<span style="color: #ec4899; font-weight: 700;">L/R</span>';
      } else if (isL) {
        pointerTag = '<span style="color: #60a5fa; font-weight: 700;">L</span>';
      } else if (isR) {
        pointerTag = '<span style="color: #a78bfa; font-weight: 700;">R</span>';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${pointerTag}</div>
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 18px;
          transition: all 0.2s;
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // 统计字符频次柱
  const freqPills = Object.entries(counts)
    .filter(([_, cnt]) => cnt > 0)
    .map(([char, cnt]) => {
      const isDominant = cnt === maxCount;
      return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; background: rgba(255,255,255,0.04); border-radius: 6px; font-size: 12px;">
        <span style="color: #38bdf8; font-weight: 700;">字符 '${char}'</span>
        <span style="color: ${isDominant ? '#34d399' : '#fbbf24'}; font-weight: 600;">
          ${cnt} 次 ${isDominant ? '★ 主导' : ''}
        </span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 字符串与双指针视口 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">滑动窗口双指针 [L .. R] 动态缩放</div>
          <div style="font-size: 11px; color: ${isValid ? '#34d399' : '#ef4444'}; font-weight: 700;">
            ${phase !== 'finish' ? (isValid ? `✓ 窗口合法 (需替换 <= ${k})` : `✗ 超出替换上限 (需替换 > ${k})`) : '探索完毕'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 75px;">
          ${charCards}
        </div>
      </div>

      <!-- 中部 字符频次面板 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
          当前窗口内字符频次分布
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
          ${freqPills || '<div style="color: #64748b; font-size: 11px;">窗口为空</div>'}
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口长度</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${windowLen}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最高主导频次 maxCount</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${maxCount}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">需替换字符数</div>
          <div style="font-size: 16px; font-weight: 700; color: ${windowLen - maxCount <= k ? '#34d399' : '#f43f5e'};">
            ${Math.max(0, windowLen - maxCount)} (上限 ${k})
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">历史最长合法长度</div>
          <div style="font-size: 18px; font-weight: 700; color: #10b981;">${bestLen}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'longest-repeating-character-replacement',
  name: '替换后的最长重复字符',
  category: 'string',
  difficulty: 2,
  learningGoal: 'LeetCode 424: 至多替换 k 次后的最长重复字符子串长度。利用滑动窗口单调不减性质，在 O(N) 线性时间内求得极值。',
  codeLanguages: CHARACTER_REPLACEMENT_CODES,
  generateSteps: (inputs) => {
    const rawS = inputs?.s as string | undefined;
    const rawK = Number(inputs?.k ?? 1);
    const s = typeof rawS === 'string' && rawS.trim().length > 0 ? rawS.trim().toUpperCase() : 'AABABBA';
    const k = isNaN(rawK) || rawK < 0 ? 1 : rawK;
    return buildCharacterReplacementSteps(s, k);
  },
  renderCanvas: (container: HTMLElement, step: CharacterReplacementStep) => {
    container.innerHTML = renderCharacterReplacementCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '大写字母字符串',
      type: 'text',
      defaultValue: 'AABABBA',
      placeholder: '例如: AABABBA',
    },
    {
      id: 'k',
      label: '最大替换次数 k',
      type: 'number',
      defaultValue: 1,
      placeholder: '允许替换次数',
    },
  ],
});
