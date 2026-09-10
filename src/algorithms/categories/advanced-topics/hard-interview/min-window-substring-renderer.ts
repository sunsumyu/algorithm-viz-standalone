/**
 * 大厂高频真题 08: 最小覆盖子串 (Minimum Window Substring)
 * LeetCode 76 / 滑动窗口最高频经典压轴题
 * 左神经典【欠账表模型】+ 双指针滑窗
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MinWindowStep extends StepBase {
  s: string;
  t: string;
  l: number;
  r: number;
  debtMap: { char: string; count: number }[];
  allDebt: number;
  bestStart: number;
  bestLen: number;
  bestSubstr: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MIN_WINDOW_CODES = {
  java: `public class MinWindowSubstring {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] map = new int[256];
        for (char c : t.toCharArray()) map[c]++;
        int allDebt = t.length();
        int l = 0, r = 0, minLen = Integer.MAX_VALUE, start = 0;

        while (r < s.length()) {
            // 1. 右指针还款
            if (map[s.charAt(r)] > 0) allDebt--;
            map[s.charAt(r)]--;

            // 2. 欠款还清，左指针催账收缩
            if (allDebt == 0) {
                while (map[s.charAt(l)] < 0) {
                    map[s.charAt(l)]++;
                    l++;
                }
                if (r - l + 1 < minLen) {
                    minLen = r - l + 1;
                    start = l;
                }
                // 弹出左边界必需字符，重新进入欠款状态
                map[s.charAt(l)]++;
                allDebt++;
                l++;
            }
            r++;
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}`,
  cpp: `class Solution {
public:
    string minWindow(string s, string t) {
        if (s.size() < t.size()) return "";
        vector<int> map(256, 0);
        for (char c : t) map[c]++;
        int allDebt = t.size(), l = 0, r = 0, minLen = INT_MAX, start = 0;

        while (r < s.size()) {
            if (map[s[r]] > 0) allDebt--;
            map[s[r]]--;
            if (allDebt == 0) {
                while (map[s[l]] < 0) {
                    map[s[l]]++;
                    l++;
                }
                if (r - l + 1 < minLen) {
                    minLen = r - l + 1;
                    start = l;
                }
                map[s[l]]++;
                allDebt++;
                l++;
            }
            r++;
        }
        return minLen == INT_MAX ? "" : s.substr(start, minLen);
    }
};`,
  python: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if len(s) < len(t): return ""
        debt_map = collections.Counter(t)
        all_debt = len(t)
        l = 0
        min_len = float('inf')
        best_start = 0

        for r, c in enumerate(s):
            if debt_map[c] > 0:
                all_debt -= 1
            debt_map[c] -= 1

            if all_debt == 0:
                while debt_map[s[l]] < 0:
                    debt_map[s[l]] += 1
                    l += 1
                if r - l + 1 < min_len:
                    min_len = r - l + 1
                    best_start = l
                debt_map[s[l]] += 1
                all_debt += 1
                l += 1
        return "" if min_len == float('inf') else s[best_start:best_start + min_len]`,
  typescript: `export function minWindow(s: string, t: string): string {
  if (s.length < t.length) return '';
  const map: number[] = new Array(256).fill(0);
  for (let i = 0; i < t.length; i++) map[t.charCodeAt(i)]++;
  let allDebt = t.length;
  let l = 0, r = 0, minLen = Infinity, start = 0;

  while (r < s.length) {
    const rc = s.charCodeAt(r);
    if (map[rc] > 0) allDebt--;
    map[rc]--;

    if (allDebt === 0) {
      while (map[s.charCodeAt(l)] < 0) {
        map[s.charCodeAt(l)]++;
        l++;
      }
      if (r - l + 1 < minLen) {
        minLen = r - l + 1;
        start = l;
      }
      map[s.charCodeAt(l)]++;
      allDebt++;
      l++;
    }
    r++;
  }
  return minLen === Infinity ? '' : s.substring(start, start + minLen);
}`
};

export function generateMinWindowSteps(s: string = 'ADOBECODEBANC', t: string = 'ABC'): MinWindowStep[] {
  const steps: MinWindowStep[] = [];
  const map = new Map<string, number>();
  for (const c of t) {
    map.set(c, (map.get(c) || 0) + 1);
  }
  let allDebt = t.length;
  let l = 0, r = 0;
  let minLen = Infinity;
  let start = 0;

  const snapshotDebt = () => {
    return Array.from(map.entries()).map(([char, count]) => ({ char, count }));
  };

  steps.push({
    s,
    t,
    l: 0,
    r: -1,
    debtMap: snapshotDebt(),
    allDebt,
    bestStart: 0,
    bestLen: 0,
    bestSubstr: '',
    decision: '初始化欠账表模型',
    message: `目标串 t = "${t}"，构建初始欠款总账: ${allDebt} 个字符。`,
    log: `Init minWindow: allDebt=${allDebt}`,
    codeLine: 4,
    statusBadge: { text: '欠账初始化', type: 'info' }
  });

  while (r < s.length) {
    const rc = s[r];
    const curDebt = map.get(rc) || 0;
    if (curDebt > 0) {
      allDebt--;
    }
    map.set(rc, curDebt - 1);

    steps.push({
      s,
      t,
      l,
      r,
      debtMap: snapshotDebt(),
      allDebt,
      bestStart: start,
      bestLen: minLen === Infinity ? 0 : minLen,
      bestSubstr: minLen === Infinity ? '' : s.substring(start, start + minLen),
      decision: `右指针移至 #${r} ('${rc}')：${curDebt > 0 ? '有效还款！总欠款减 1' : '借入富余字符'}`,
      message: `字符 '${rc}' 存量更新为 ${curDebt - 1}，当前全网剩余欠款: ${allDebt}。`,
      log: `r=${r} char='${rc}' allDebt=${allDebt}`,
      codeLine: 12,
      statusBadge: curDebt > 0 ? { text: `有效还款 '${rc}'`, type: 'success' } : { text: '滑窗吸收', type: 'info' }
    });

    if (allDebt === 0) {
      // 欠款全还清，收缩左边界
      while ((map.get(s[l]) || 0) < 0) {
        const lc = s[l];
        map.set(lc, (map.get(lc) || 0) + 1);
        l++;
      }

      const curWinLen = r - l + 1;
      const isBest = curWinLen < minLen;
      if (isBest) {
        minLen = curWinLen;
        start = l;
      }

      steps.push({
        s,
        t,
        l,
        r,
        debtMap: snapshotDebt(),
        allDebt,
        bestStart: start,
        bestLen: minLen,
        bestSubstr: s.substring(start, start + minLen),
        decision: `欠款全部还清！左边界压缩至极限 #${l}，当前有效窗口 [${l}..${r}] 长度 = ${curWinLen}`,
        message: `截获覆盖子串 "${s.substring(l, r + 1)}"! ${isBest ? '🎉 刷新全局最短子串纪录！' : ''}`,
        log: `Cover window [${l}..${r}] len=${curWinLen}`,
        codeLine: 18,
        statusBadge: isBest ? { text: `刷新最短: ${curWinLen}`, type: 'success' } : { text: `有效覆盖: ${curWinLen}`, type: 'warning' }
      });

      // 弹出必需字符
      const popChar = s[l];
      map.set(popChar, (map.get(popChar) || 0) + 1);
      allDebt++;
      l++;
    }

    r++;
  }

  const finalAns = minLen === Infinity ? '' : s.substring(start, start + minLen);
  steps.push({
    s,
    t,
    l,
    r: s.length - 1,
    debtMap: snapshotDebt(),
    allDebt,
    bestStart: start,
    bestLen: minLen === Infinity ? 0 : minLen,
    bestSubstr: finalAns,
    decision: `滑窗全流程结束！最终最小覆盖子串 = "${finalAns}"`,
    message: `遍历完毕，在 O(N) 线性时间内找到最短覆盖子串: "${finalAns}" (长度: ${finalAns.length})。`,
    log: `Finished. ans="${finalAns}"`,
    codeLine: 28,
    statusBadge: { text: `答案: "${finalAns}"`, type: 'success' }
  });

  return steps;
}

export function renderMinWindowSandbox(step: MinWindowStep): string {
  const charsHtml = step.s.split('').map((c, idx) => {
    const inWindow = idx >= step.l && idx <= step.r;
    const isL = idx === step.l;
    const isR = idx === step.r;

    let bg = '#ffffff';
    let border = '#cbd5e1';
    let color = '#475569';

    if (inWindow) {
      bg = '#e0f2fe';
      border = '#38bdf8';
      color = '#0369a1';
    }
    if (isL) {
      border = '2px solid #f59e0b';
    } else if (isR) {
      border = '2px solid #22c55e';
    }

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; margin:2px 3px;">
        <div style="width:34px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:6px; background:${bg}; border:${border}; font-weight:800; font-size:14px; color:${color};">
          ${c}
        </div>
        <span style="font-size:10px; color:#64748b; margin-top:2px;">#${idx}</span>
        <span style="font-size:9px; height:12px; margin-top:1px;">
          ${isL && isR ? '<b style="color:#d97706;">L,R</b>' : isL ? '<b style="color:#d97706;">L</b>' : isR ? '<b style="color:#16a34a;">R</b>' : ''}
        </span>
      </div>
    `;
  }).join('');

  const debtTableHtml = step.debtMap.map(d => `
    <div style="display:inline-flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:4px 8px; margin:3px;">
      <span style="font-weight:700; color:#0f172a;">'${d.char}':</span>
      <span style="font-weight:800; color:${d.count > 0 ? '#ef4444' : d.count === 0 ? '#10b981' : '#6366f1'};">
        ${d.count > 0 ? `欠 ${d.count}` : d.count === 0 ? '平账' : `富余 ${Math.abs(d.count)}`}
      </span>
    </div>
  `).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 字符串滑窗物理全景条 -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:13px; color:#0f172a;">
            🪟 字符串滑动窗口物理全景 (目标串 t = "${step.t}")
          </span>
          <span style="font-size:11px; color:#64748b;">
            当前滑窗区间 [${step.l} .. ${step.r}]
          </span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; padding:4px 0;">
          ${charsHtml}
        </div>
      </div>

      <!-- 欠账表借贷看板 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#0f172a;">💳 欠账表状态明细</span>
          <span style="font-size:12px; font-weight:800; color:${step.allDebt === 0 ? '#15803d' : '#b91c1c'};">
            ${step.allDebt === 0 ? '🎉 所有欠账已还清！' : `全网累计尚欠: ${step.allDebt} 个字符`}
          </span>
        </div>
        <div style="display:flex; flex-wrap:wrap;">
          ${debtTableHtml}
        </div>
      </div>

      <!-- 成果指标 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前窗口长度</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">${step.r >= step.l ? step.r - step.l + 1 : 0}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">历史最短长度</div>
          <div style="font-size:16px; font-weight:800; color:#15803d;">${step.bestLen > 0 ? step.bestLen : '-'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前最优覆盖子串</div>
          <div style="font-size:16px; font-weight:800; color:#d97706; font-family:monospace;">${step.bestSubstr ? `"${step.bestSubstr}"` : '无'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '滑动窗口欠账表法则',
        '右指针不断扩展吸纳字符向欠账表还款；当总欠账 allDebt == 0 时，左指针向前挤压富余字符直到极限，捕获最优子串！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const minWindowSubstringVisualizer = registerDeclarativeAlgorithm<MinWindowStep>({
  id: 'min-window-substring',
  name: '大厂高频真题: 最小覆盖子串 (Minimum Window Substring)',
  category: 'string',
  icon: '🪟',
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '深刻掌握滑动窗口欠账表模型，在 O(N) 线性时间内求解最小覆盖子串经典难题',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 76)</h3>
      <p>给你一个字符串 <code>s</code> 、一个字符串 <code>t</code> 。返回 <code>s</code> 中涵盖 <code>t</code> 所有字符的最小子串。如果不存在符合条件的子串，返回空字符串 <code>""</code>。</p>
      <p><strong>左神欠账表精髓：</strong>将 $t$ 的字符频次视为债务，右指针吸收字符还款，当全网欠账还清时，左指针向前催收挤压富余字符，达到常数空间 $O(N)$ 极速解法！</p>
    </div>
  `,
  codeLanguages: MIN_WINDOW_CODES,
  inputs: [
    {
      id: 's',
      label: '源字符串 (s)',
      type: 'text',
      defaultValue: 'ADOBECODEBANC',
    },
    {
      id: 't',
      label: '目标串 (t)',
      type: 'text',
      defaultValue: 'ABC',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'ADOBECODEBANC');
    const t = String(input.t || 'ABC');
    return generateMinWindowSteps(s, t);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMinWindowSandbox(step)}
      </div>
    `;
  },
});
