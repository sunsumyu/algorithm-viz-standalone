/**
 * 大厂高频真题 06: 正则表达式匹配 (Regular Expression Matching)
 * LeetCode 10 / 字符串二维动态规划最高频硬核题
 * 支持 '.' 和 '*' 的全功能正则匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface RegexStep extends StepBase {
  s: string;
  p: string;
  i: number;
  j: number;
  dp: boolean[][];
  matched: boolean;
  branchType?: 'normal' | 'star-zero' | 'star-multi';
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const REGEX_MATCHING_CODES = {
  java: `public class RegexMatching {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true;
        // 初始化空串与形如 a*b*c* 的模式匹配
        for (int j = 2; j <= n; j += 2) {
            if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                char sc = s.charAt(i - 1), pc = p.charAt(j - 1);
                if (pc != '*') {
                    dp[i][j] = dp[i - 1][j - 1] && (sc == pc || pc == '.');
                } else {
                    // '*' 匹配 0 次 或 匹配多次
                    boolean matchZero = dp[i][j - 2];
                    boolean matchMulti = dp[i - 1][j] && (sc == p.charAt(j - 2) || p.charAt(j - 2) == '.');
                    dp[i][j] = matchZero || matchMulti;
                }
            }
        }
        return dp[m][n];
    }
}`,
  cpp: `class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true;
        for (int j = 2; j <= n; j += 2) {
            if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (p[j - 1] != '*') {
                    dp[i][j] = dp[i - 1][j - 1] && (s[i - 1] == p[j - 1] || p[j - 1] == '.');
                } else {
                    bool matchZero = dp[i][j - 2];
                    bool matchMulti = dp[i - 1][j] && (s[i - 1] == p[j - 2] || p[j - 2] == '.');
                    dp[i][j] = matchZero || matchMulti;
                }
            }
        }
        return dp[m][n];
    }
};`,
  python: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(2, n + 1, 2):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] != '*':
                    dp[i][j] = dp[i - 1][j - 1] and (s[i - 1] == p[j - 1] or p[j - 1] == '.')
                else:
                    match_zero = dp[i][j - 2]
                    match_multi = dp[i - 1][j] and (s[i - 1] == p[j - 2] or p[j - 2] == '.')
                    dp[i][j] = match_zero or match_multi
        return dp[m][n]`,
  typescript: `export function isMatch(s: string, p: string): boolean {
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j += 2) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] !== '*') {
        dp[i][j] = dp[i - 1][j - 1] && (s[i - 1] === p[j - 1] || p[j - 1] === '.');
      } else {
        const matchZero = dp[i][j - 2];
        const matchMulti = dp[i - 1][j] && (s[i - 1] === p[j - 2] || p[j - 2] === '.');
        dp[i][j] = matchZero || matchMulti;
      }
    }
  }
  return dp[m][n];
}`
};

export const REGEX_MATCHING_CODE_LINES = {
  init: { java: 4, cpp: 6, python: 4, typescript: 4 },
  normalMatch: { java: 15, cpp: 13, python: 13, typescript: 12 },
  starMatch: { java: 20, cpp: 18, python: 16, typescript: 16 },
  finish: { java: 24, cpp: 22, python: 18, typescript: 19 },
};

export function generateRegexSteps(s: string = 'aab', p: string = 'c*a*b'): RegexStep[] {
  const steps: RegexStep[] = [];
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  for (let j = 2; j <= n; j += 2) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }

  const makeMetrics = (i: number, j: number, cellVal: boolean, branch: string) => ({
    textChar: i === 0 ? 'ε (空串)' : `s[${i - 1}]='${s[i - 1]}'`,
    patternChar: j === 0 ? 'ε (空串)' : `p[${j - 1}]='${p[j - 1]}'`,
    cellValue: cellVal ? 'true (匹配)' : 'false (未配)',
    branchType: branch,
  });

  steps.push({
    s,
    p,
    i: 0,
    j: 0,
    dp: dp.map(r => [...r]),
    matched: true,
    decision: `初始化 DP 矩阵 dp[${m + 1}][${n + 1}]，空串基底 dp[0][0] = true`,
    message: `匹配目标文本 s = "${s}"，模式串 p = "${p}"。处理首行 '*' 抵消模式。`,
    log: 'Init regex DP matrix',
    codeLine: REGEX_MATCHING_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: makeMetrics(0, 0, true, '空串基底初始化'),
    ans: '-',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sc = s[i - 1];
      const pc = p[j - 1];

      if (pc !== '*') {
        const charMatch = sc === pc || pc === '.';
        dp[i][j] = dp[i - 1][j - 1] && charMatch;

        steps.push({
          s,
          p,
          i,
          j,
          dp: dp.map(r => [...r]),
          matched: dp[i][j],
          branchType: 'normal',
          decision: `普通字符比对: s[${i - 1}]('${sc}') 与 p[${j - 1}]('${pc}') ${charMatch ? '匹配' : '不匹配'}`,
          message: `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] && charMatch -> ${dp[i][j]}`,
          log: `dp[${i}][${j}] = ${dp[i][j]}`,
          codeLine: REGEX_MATCHING_CODE_LINES.normalMatch,
          statusBadge: dp[i][j] ? { text: '匹配成功', type: 'success' } : { text: '匹配失败', type: 'danger' },
          metrics: makeMetrics(i, j, dp[i][j], `单字符对齐 [${sc} vs ${pc}]`),
          ans: '-',
        });
      } else {
        const prevP = p[j - 2];
        const matchZero = dp[i][j - 2];
        const matchMulti = dp[i - 1][j] && (sc === prevP || prevP === '.');
        dp[i][j] = matchZero || matchMulti;

        const branchDesc = matchZero ? '星号 0 次消解 (matchZero)' : matchMulti ? '星号多重展开 (matchMulti)' : '星号失配';

        steps.push({
          s,
          p,
          i,
          j,
          dp: dp.map(r => [...r]),
          matched: dp[i][j],
          branchType: matchZero ? 'star-zero' : 'star-multi',
          decision: `通配符 '*' 分支决策：前导符 '${prevP}*' 匹配 0 次(${matchZero}) 或 匹配多次(${matchMulti})`,
          message: `综合判定 dp[${i}][${j}] = ${matchZero} || ${matchMulti} -> ${dp[i][j]}`,
          log: `dp[${i}][${j}] '*' branch -> ${dp[i][j]}`,
          codeLine: REGEX_MATCHING_CODE_LINES.starMatch,
          statusBadge: dp[i][j] ? { text: '通配成功', type: 'success' } : { text: '通配失败', type: 'danger' },
          metrics: makeMetrics(i, j, dp[i][j], branchDesc),
          ans: '-',
        });
      }
    }
  }

  const finalMatch = dp[m][n];
  steps.push({
    s,
    p,
    i: m,
    j: n,
    dp: dp.map(r => [...r]),
    matched: finalMatch,
    decision: `全串正则匹配判定完成！结果 = ${finalMatch ? '完全匹配 (TRUE)' : '不匹配 (FALSE)'}`,
    message: `整个字符串 "${s}" 与模式串 "${p}" 的最终匹配结论为: ${finalMatch}。`,
    log: `Finished isMatch = ${finalMatch}`,
    codeLine: REGEX_MATCHING_CODE_LINES.finish,
    statusBadge: finalMatch ? { text: '完美匹配', type: 'success' } : { text: '不匹配', type: 'danger' },
    metrics: makeMetrics(m, n, finalMatch, finalMatch ? '完全匹配达成' : '模式失配'),
    ans: finalMatch ? 'true (完全匹配)' : 'false (不匹配)',
  });

  return steps;
}

export function renderRegexSandbox(step: RegexStep): string {
  const dpTableHtml = `
    <table style="border-collapse:collapse; width:100%; font-family:monospace; font-size:12px; text-align:center;">
      <thead>
        <tr>
          <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:rgba(30,41,59,0.5); color:#94a3b8;">s \\ p</th>
          <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:rgba(30,41,59,0.5); color:#cbd5e1; font-weight:700;">ε</th>
          ${step.p.split('').map((c, j) => `
            <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:${j + 1 === step.j ? 'rgba(245,158,11,0.25)' : 'rgba(30,41,59,0.5)'}; color:${j + 1 === step.j ? '#fbbf24' : '#cbd5e1'}; font-weight:700;">
              ${c}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${step.dp.map((row, i) => `
          <tr>
            <td style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:${i === step.i ? 'rgba(56,189,248,0.25)' : 'rgba(30,41,59,0.4)'}; color:${i === step.i ? '#38bdf8' : '#cbd5e1'}; font-weight:700;">
              ${i === 0 ? 'ε' : step.s[i - 1]}
            </td>
            ${row.map((val, j) => {
              const isCur = i === step.i && j === step.j;
              let bg = val ? 'rgba(16,185,129,0.18)' : 'rgba(15,23,42,0.3)';
              let color = val ? '#34d399' : '#64748b';
              let border = '1px solid rgba(255,255,255,0.08)';

              if (isCur) {
                border = '2px solid #38bdf8';
                bg = val ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.3)';
                color = val ? '#ecfdf5' : '#fecdd3';
              }

              return `
                <td style="padding:6px 10px; border:${border}; background:${bg}; color:${color}; font-weight:${val || isCur ? 700 : 500}; box-shadow:${isCur ? '0 0 8px rgba(56,189,248,0.4)' : 'none'};">
                  ${val ? 'T' : 'F'}
                </td>
              `;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  return `
    <div style="display:flex; flex-direction:column; gap:14px; width:100%; height:100%; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 双串字符比对状态条 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8;">待匹配文本串 (Text s)</div>
            <div style="font-size:16px; font-weight:700; color:#38bdf8; font-family:monospace; margin-top:2px;">
              "${step.s}"
            </div>
          </div>
          <div style="font-size:12px; color:#94a3b8; font-family:monospace;">
            i = <span style="color:#38bdf8; font-weight:bold;">${step.i}</span> / ${step.s.length}
          </div>
        </div>

        <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8;">正则表达式模式串 (Pattern p)</div>
            <div style="font-size:16px; font-weight:700; color:#fbbf24; font-family:monospace; margin-top:2px;">
              "${step.p}"
            </div>
          </div>
          <div style="font-size:12px; color:#94a3b8; font-family:monospace;">
            j = <span style="color:#fbbf24; font-weight:bold;">${step.j}</span> / ${step.p.length}
          </div>
        </div>
      </div>

      <!-- 二维 DP 状态热力网格 -->
      <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px; flex:1; display:flex; flex-direction:column; overflow:auto;">
        <div style="font-weight:600; font-size:13px; color:var(--text-color, #cbd5e1); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>📊 正则匹配二维状态矩阵 (dp[i][j])</span>
          <span style="font-size:11px; color:#94a3b8;">T = 匹配(True), F = 不匹配(False)</span>
        </div>
        <div style="overflow-x:auto;">
          ${dpTableHtml}
        </div>
      </div>
    </div>
  `;
}

export const regexMatchingVisualizer = registerDeclarativeAlgorithm<RegexStep>({
  id: 'hard-regex-matching',
  name: '大厂高频真题: 正则表达式匹配 (Regex Matching)',
  category: 'string',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '彻底掌握带 . 和 * 字符的二维动态规划状态转移与通配符展开机制',
  metrics: [
    { id: 'textChar', label: '文本字符 (Text Char)', color: 'blue' },
    { id: 'patternChar', label: '模式字符 (Pattern Char)', color: 'amber' },
    { id: 'cellValue', label: 'DP 单元格 (dp[i][j])', color: 'emerald' },
    { id: 'branchType', label: '匹配分支 (Branch)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 10)</h3>
      <p>给你一个字符串 <code>s</code> 和一个字符规律 <code>p</code>，请你实现一个支持 <code>'.'</code> 和 <code>'*'</code> 的正则表达式匹配：</p>
      <ul>
        <li><code>'.'</code> 匹配任意单个字符。</li>
        <li><code>'*'</code> 匹配零个或多个前面的那一个元素。</li>
      </ul>
      <p>所谓匹配，是要涵盖<strong>整个</strong>字符串 <code>s</code> 的，而不是部分字符串。</p>
    </div>
  `,
  codeLanguages: REGEX_MATCHING_CODES,
  inputs: [
    {
      id: 's',
      label: '文本串 (s)',
      type: 'text',
      defaultValue: 'aab',
    },
    {
      id: 'p',
      label: '模式串 (p)',
      type: 'text',
      defaultValue: 'c*a*b',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'aab');
    const p = String(input.p || 'c*a*b');
    return generateRegexSteps(s, p);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderRegexSandbox(step);
  },
});
