/**
 * 正则表达式匹配二维动态规划步进编译器 (LeetCode 10 / 大厂高频 Hard)
 * Step Compiler: 前向标准二维 DP 表填表 (前向自底向上填表 + '*' 0次/多次分支推演)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

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

export const REGEX_MATCHING_CODES: Record<string, string> = {
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
    log: 'Init dp[0][0]=true',
    codeLine: REGEX_MATCHING_CODE_LINES.init,
    statusBadge: { text: '基底就绪', type: 'info' },
    metrics: makeMetrics(0, 0, true, '空串基底'),
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
          decision: `普通字符比对：s[${i - 1}]='${sc}', p[${j - 1}]='${pc}' (匹配=${charMatch})。dp[${i}][${j}] = dp[${i - 1}][${j - 1}] && match -> ${dp[i][j]}`,
          message: charMatch ? `字符契合！继承自左上方 dp[${i - 1}][${j - 1}]` : '字符失配，当前状态为 false',
          log: `dp[${i}][${j}] = ${dp[i][j]}`,
          codeLine: REGEX_MATCHING_CODE_LINES.normalMatch,
          statusBadge: dp[i][j] ? { text: '单字匹配', type: 'success' } : { text: '单字失配', type: 'danger' },
          metrics: makeMetrics(i, j, dp[i][j], pc === '.' ? '点号通配' : '普通字符'),
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
