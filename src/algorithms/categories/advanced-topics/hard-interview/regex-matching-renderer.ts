/**
 * 大厂高频真题 06: 正则表达式匹配 (Regular Expression Matching)
 * LeetCode 10 / 字符串二维动态规划最高频硬核题
 * 支持 '.' 和 '*' 的全功能正则匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateRegexSteps(s: string = 'aab', p: string = 'c*a*b'): RegexStep[] {
  const steps: RegexStep[] = [];
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  for (let j = 2; j <= n; j += 2) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }

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
    codeLine: 4,
    statusBadge: { text: '初始化', type: 'info' }
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
          codeLine: 13,
          statusBadge: dp[i][j] ? { text: '匹配成功', type: 'success' } : { text: '匹配失败', type: 'danger' }
        });
      } else {
        const prevP = p[j - 2];
        const matchZero = dp[i][j - 2];
        const matchMulti = dp[i - 1][j] && (sc === prevP || prevP === '.');
        dp[i][j] = matchZero || matchMulti;

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
          codeLine: 17,
          statusBadge: dp[i][j] ? { text: '通配成功', type: 'success' } : { text: '通配失败', type: 'danger' }
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
    codeLine: 23,
    statusBadge: finalMatch ? { text: '完美匹配', type: 'success' } : { text: '不匹配', type: 'danger' }
  });

  return steps;
}

export function renderRegexSandbox(step: RegexStep): string {
  const dpTableHtml = `
    <table style="border-collapse:collapse; width:100%; font-family:monospace; font-size:11px; text-align:center;">
      <thead>
        <tr>
          <th style="padding:4px; border:1px solid #cbd5e1; background:#f1f5f9;">s \\ p</th>
          <th style="padding:4px; border:1px solid #cbd5e1; background:#f1f5f9;">ε</th>
          ${step.p.split('').map((c, j) => `
            <th style="padding:4px; border:1px solid #cbd5e1; background:${j + 1 === step.j ? '#fef3c7' : '#f1f5f9'}; color:${j + 1 === step.j ? '#b45309' : '#334155'}; font-weight:700;">
              ${c}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${step.dp.map((row, i) => `
          <tr>
            <td style="padding:4px; border:1px solid #cbd5e1; background:${i === step.i ? '#e0e7ff' : '#f8fafc'}; color:${i === step.i ? '#3730a3' : '#334155'}; font-weight:700;">
              ${i === 0 ? 'ε' : step.s[i - 1]}
            </td>
            ${row.map((val, j) => {
              const isCur = i === step.i && j === step.j;
              let bg = val ? '#dcfce7' : '#ffffff';
              let color = val ? '#15803d' : '#94a3b8';
              let border = '1px solid #cbd5e1';

              if (isCur) {
                border = '2px solid #2563eb';
                bg = val ? '#bbf7d0' : '#fee2e2';
                color = val ? '#14532d' : '#b91c1c';
              }

              return `
                <td style="padding:4px; border:${border}; background:${bg}; color:${color}; font-weight:${val || isCur ? 700 : 400};">
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
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 双串字符比对看板 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-size:11px; color:#64748b; margin-bottom:4px;">待匹配文本串 (Text s)</div>
          <div style="font-size:18px; font-weight:800; color:#0f172a; font-family:monospace;">
            ${step.s} <span style="font-size:12px; color:#2563eb;">(i=${step.i})</span>
          </div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-size:11px; color:#64748b; margin-bottom:4px;">正则表达式模式串 (Pattern p)</div>
          <div style="font-size:18px; font-weight:800; color:#d97706; font-family:monospace;">
            ${step.p} <span style="font-size:12px; color:#d97706;">(j=${step.j})</span>
          </div>
        </div>
      </div>

      <!-- 二维 DP 状态热力网格 -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:8px;">
          📊 正则匹配二维 DP 表 (dp[i][j])
        </div>
        <div style="overflow-x:auto;">
          ${dpTableHtml}
        </div>
      </div>

      ${renderFormulaCard(
        '正则表达式核心转移公理',
        '遇到非 * 号：dp[i][j] = dp[i-1][j-1] && match；遇到 * 号：dp[i][j] = dp[i][j-2] (消解0次) || (dp[i-1][j] && match (多重展开))',
        step.decision,
        step.statusBadge
      )}
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
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderRegexSandbox(step)}
      </div>
    `;
  },
});
