/**
 * 大厂高频真题 08: 最小覆盖子串 (Minimum Window Substring)
 * LeetCode 76 / 滑动窗口最高频经典压轴题
 * 左神经典【欠账表模型】+ 双指针滑窗
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

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
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
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

export const MIN_WINDOW_CODE_LINES = {
  init: { java: 6, cpp: 7, python: 6, typescript: 6 },
  expand: { java: 11, cpp: 11, python: 13, typescript: 11 },
  shrink: { java: 21, cpp: 18, python: 20, typescript: 17 },
  finish: { java: 31, cpp: 27, python: 25, typescript: 28 },
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
    codeLine: MIN_WINDOW_CODE_LINES.init,
    statusBadge: { text: '欠账初始化', type: 'info' },
    metrics: {
      windowLen: '0',
      allDebt: `${allDebt}`,
      bestLen: '—',
      bestSubstr: '无',
    },
    ans: '""',
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
      codeLine: MIN_WINDOW_CODE_LINES.expand,
      statusBadge: curDebt > 0 ? { text: `有效还款 '${rc}'`, type: 'success' } : { text: '滑窗吸收', type: 'info' },
      metrics: {
        windowLen: `${r - l + 1}`,
        allDebt: `${allDebt}`,
        bestLen: minLen === Infinity ? '—' : `${minLen}`,
        bestSubstr: minLen === Infinity ? '无' : `"${s.substring(start, start + minLen)}"`,
      },
      ans: minLen === Infinity ? '""' : `"${s.substring(start, start + minLen)}"`,
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
        codeLine: MIN_WINDOW_CODE_LINES.shrink,
        statusBadge: isBest ? { text: `刷新最短: ${curWinLen}`, type: 'success' } : { text: `有效覆盖: ${curWinLen}`, type: 'warning' },
        metrics: {
          windowLen: `${curWinLen}`,
          allDebt: `${allDebt}`,
          bestLen: `${minLen}`,
          bestSubstr: `"${s.substring(start, start + minLen)}"`,
        },
        ans: `"${s.substring(start, start + minLen)}"`,
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
    codeLine: MIN_WINDOW_CODE_LINES.finish,
    statusBadge: { text: `答案: "${finalAns}"`, type: 'success' },
    metrics: {
      windowLen: finalAns ? `${finalAns.length}` : '0',
      allDebt: `${allDebt}`,
      bestLen: finalAns ? `${finalAns.length}` : '—',
      bestSubstr: finalAns ? `"${finalAns}"` : '无',
    },
    ans: `"${finalAns}"`,
  });

  return steps;
}

export function renderMinWindowSandbox(step: MinWindowStep): string {
  const charsHtml = step.s.split('').map((c, idx) => {
    const inWindow = idx >= step.l && idx <= step.r;
    const isL = idx === step.l;
    const isR = idx === step.r;

    let cellBg = '#f8fafc';
    let cellBorder = '1px solid #e2e8f0';
    let cellColor = '#475569';
    let shadow = 'none';

    if (inWindow) {
      cellBg = '#f0f9ff';
      cellBorder = '1.5px solid #38bdf8';
      cellColor = '#0369a1';
      shadow = '0 1px 3px rgba(56, 189, 248, 0.15)';
    }
    if (isL) {
      cellBorder = '2px solid #f59e0b';
    } else if (isR) {
      cellBorder = '2px solid #22c55e';
    }

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; margin:3px 4px; flex-shrink: 0;">
        <span style="font-size:10px; font-family:'JetBrains Mono', monospace; color:#94a3b8; margin-bottom:2px;">#${idx}</span>
        <div style="width:36px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:${cellBg}; border:${cellBorder}; box-shadow:${shadow}; font-weight:800; font-size:16px; font-family:'JetBrains Mono', monospace; color:${cellColor}; transition: all 0.2s ease;">
          ${c}
        </div>
        <span style="font-size:9px; height:14px; margin-top:2px;">
          ${isL && isR ? '<b style="color:#d97706; background:#fef3c7; padding:1px 3px; border-radius:3px;">L,R</b>' : isL ? '<b style="color:#d97706; background:#fef3c7; padding:1px 3px; border-radius:3px;">L</b>' : isR ? '<b style="color:#16a34a; background:#dcfce7; padding:1px 3px; border-radius:3px;">R</b>' : ''}
        </span>
      </div>
    `;
  }).join('');

  const debtTableHtml = step.debtMap.map(d => {
    let chipBg = '#f8fafc';
    let chipBorder = '#e2e8f0';
    let valColor = '#64748b';
    let valText = `${d.count}`;

    if (d.count > 0) {
      chipBg = '#fef2f2';
      chipBorder = '#fecaca';
      valColor = '#ef4444';
      valText = `欠 ${d.count}`;
    } else if (d.count === 0) {
      chipBg = '#f0fdf4';
      chipBorder = '#bbf7d0';
      valColor = '#16a34a';
      valText = '平账 ✓';
    } else {
      chipBg = '#eff6ff';
      chipBorder = '#bfdbfe';
      valColor = '#2563eb';
      valText = `富余 ${Math.abs(d.count)}`;
    }

    return `
      <div style="display:inline-flex; align-items:center; gap:6px; background:${chipBg}; border:1px solid ${chipBorder}; border-radius:8px; padding:4px 10px; margin:3px; font-family:'JetBrains Mono', monospace; font-size:12px;">
        <span style="font-weight:700; color:#0f172a;">'${d.char}':</span>
        <span style="font-weight:800; color:${valColor};">${valText}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:14px; width:100%; height:100%; justify-content:center; padding:12px 6px; box-sizing:border-box;">
      <!-- 欠账借贷与滑窗状态概览 -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:0 4px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:700; color:#0f172a;">💳 欠账表实时账本 (目标串 t = "${step.t}"):</span>
          <div style="display:flex; flex-wrap:wrap;">
            ${debtTableHtml}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; font-size:11px; padding:4px 10px; border-radius:6px; background:#f1f5f9; color:#475569;">
          <span>当前区间: <strong style="color:#2563eb; font-family:monospace;">[${step.l} .. ${step.r}]</strong></span>
          <span>·</span>
          <span style="font-weight:700; color:${step.allDebt === 0 ? '#16a34a' : '#dc2626'};">
            ${step.allDebt === 0 ? '✓ 全网欠账已清' : `尚欠: ${step.allDebt} 字符`}
          </span>
        </div>
      </div>

      <!-- 字符轨道滚动视口 (纯粹主画布，占据主导地位) -->
      <div style="display:flex; align-items:center; overflow-x:auto; padding:18px 12px; background:#ffffff; border:1px solid #f1f5f9; border-radius:12px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
        ${charsHtml}
      </div>

      <!-- 底部图例说明 -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0 8px; font-size:11px; color:#64748b;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#fef3c7; border:1.5px solid #f59e0b;"></span>
            L 左收缩指针
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#dcfce7; border:1.5px solid #22c55e;"></span>
            R 右扩张指针
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#f0f9ff; border:1.5px solid #38bdf8;"></span>
            滑动窗口覆盖区间
          </span>
        </div>
        <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:#94a3b8;">
          最优解: ${step.bestSubstr ? `"${step.bestSubstr}"` : '—'}
        </span>
      </div>
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
  metrics: [
    { id: 'windowLen', label: '窗口长度', color: '#0284c7' },
    { id: 'allDebt', label: '剩余欠账', color: '#ef4444' },
    { id: 'bestLen', label: '最短长度', color: '#16a34a' },
    { id: 'bestSubstr', label: '最优子串', color: '#d97706' },
  ],
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
    container.innerHTML = renderMinWindowSandbox(step);
  },
});
