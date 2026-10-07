import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface PalindromePartitionStep extends StepBase {
  s: string;
  isPal: boolean[][];
  dp: number[];
  currentI: number;
  currentJ: number;
  phase: 'init' | 'check-full' | 'transition' | 'finish';
  message: string;
  log: string;
  codeLine: number | HighlightTarget;
}

export const PALINDROME_PARTITION_CODES = {
  java: `public class Solution {
    public int minCut(String s) {
        int n = s.length();
        boolean[][] isPal = new boolean[n][n];
        for (int r = 0; r < n; r++) {
            for (int l = 0; l <= r; l++) {
                if (s.charAt(l) == s.charAt(r) && (r - l <= 2 || isPal[l + 1][r - 1])) {
                    isPal[l][r] = true;
                }
            }
        }
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) {
            if (isPal[0][i]) {
                dp[i] = 0; // 整个前缀自身就是回文
            } else {
                dp[i] = i; // 最坏情况切 i 刀
                for (int j = 0; j < i; j++) {
                    if (isPal[j + 1][i]) {
                        dp[i] = Math.min(dp[i], dp[j] + 1);
                    }
                }
            }
        }
        return dp[n - 1];
    }
}`,
  cpp: `class Solution {
public:
    int minCut(string s) {
        int n = s.size();
        vector<vector<bool>> isPal(n, vector<bool>(n, false));
        for (int r = 0; r < n; ++r) {
            for (int l = 0; l <= r; ++l) {
                if (s[l] == s[r] && (r - l <= 2 || isPal[l + 1][r - 1])) {
                    isPal[l][r] = true;
                }
            }
        }
        vector<int> dp(n);
        for (int i = 0; i < n; ++i) {
            if (isPal[0][i]) {
                dp[i] = 0;
            } else {
                dp[i] = i;
                for (int j = 0; j < i; ++j) {
                    if (isPal[j + 1][i]) {
                        dp[i] = min(dp[i], dp[j] + 1);
                    }
                }
            }
        }
        return dp[n - 1];
    }
};`,
  python: `class Solution:
    def minCut(self, s: str) -> int:
        n = len(s)
        is_pal = [[False] * n for _ in range(n)]
        for r in range(n):
            for l in range(r + 1):
                if s[l] == s[r] and (r - l <= 2 or is_pal[l + 1][r - 1]):
                    is_pal[l][r] = True
        dp = [0] * n
        for i in range(n):
            if is_pal[0][i]:
                dp[i] = 0
            else:
                dp[i] = i
                for j in range(i):
                    if is_pal[j + 1][i]:
                        dp[i] = min(dp[i], dp[j] + 1)
        return dp[-1]`,
  typescript: `export function minCut(s: string): number {
    const n = s.length;
    const isPal: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
    for (let r = 0; r < n; r++) {
        for (let l = 0; l <= r; l++) {
            if (s[l] === s[r] && (r - l <= 2 || isPal[l + 1][r - 1])) {
                isPal[l][r] = true;
            }
        }
    }
    const dp = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        if (isPal[0][i]) {
            dp[i] = 0;
        } else {
            dp[i] = i;
            for (let j = 0; j < i; j++) {
                if (isPal[j + 1][i]) {
                    dp[i] = Math.min(dp[i], dp[j] + 1);
                }
            }
        }
    }
    return dp[n - 1];
}`,
};

export const PALINDROME_PARTITION_CODE_LINES = {
  init: { java: 12, cpp: 12, python: 8, typescript: 10 },
  checkFull: { java: 15, cpp: 14, python: 11, typescript: 13 },
  transition: { java: 17, cpp: 16, python: 13, typescript: 15 },
  update: { java: 20, cpp: 19, python: 16, typescript: 18 },
  finish: { java: 25, cpp: 24, python: 18, typescript: 22 },
};

export function buildPalindromePartitionSteps(s: string = 'aabcb'): PalindromePartitionStep[] {
  const steps: PalindromePartitionStep[] = [];
  const n = s.length;

  const isPal: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let r = 0; r < n; r++) {
    for (let l = 0; l <= r; l++) {
      if (s[l] === s[r] && (r - l <= 2 || isPal[l + 1][r - 1])) {
        isPal[l][r] = true;
      }
    }
  }

  const dp = new Array(n).fill(0);

  steps.push({
    s,
    isPal,
    dp: [...dp],
    currentI: 0,
    currentJ: -1,
    phase: 'init',
    message: `算法启动：原字符串 "${s}" (长 ${n})。完成子串回文矩阵 isPal 预处理，开始计算前缀最少分割 DP 数组。`,
    log: `回文矩阵就绪，分配 dp[0..${n - 1}]`,
    codeLine: PALINDROME_PARTITION_CODE_LINES.init,
  });

  for (let i = 0; i < n; i++) {
    if (isPal[0][i]) {
      dp[i] = 0;
      steps.push({
        s,
        isPal,
        dp: [...dp],
        currentI: i,
        currentJ: -1,
        phase: 'check-full',
        message: `前缀 s[0..${i}] ("${s.slice(0, i + 1)}") 自身就是回文串！无需任何分割，dp[${i}] = 0。`,
        log: `前缀 [0..${i}] 是回文，dp[${i}]=0`,
        codeLine: PALINDROME_PARTITION_CODE_LINES.checkFull,
      });
    } else {
      dp[i] = i;
      steps.push({
        s,
        isPal,
        dp: [...dp],
        currentI: i,
        currentJ: -1,
        phase: 'transition',
        message: `前缀 s[0..${i}] ("${s.slice(0, i + 1)}") 不是整体回文。初始化基线分割 dp[${i}] = ${i}，遍历前置分割点 j。`,
        log: `dp[${i}] 基线初值=${i}`,
        codeLine: PALINDROME_PARTITION_CODE_LINES.transition,
      });

      for (let j = 0; j < i; j++) {
        if (isPal[j + 1][i]) {
          const oldVal = dp[i];
          dp[i] = Math.min(dp[i], dp[j] + 1);
          steps.push({
            s,
            isPal,
            dp: [...dp],
            currentI: i,
            currentJ: j,
            phase: 'transition',
            message: `分割点 j = ${j}：后缀 s[${j + 1}..${i}] ("${s.slice(j + 1, i + 1)}") 是回文！转移方程 dp[${i}] = min(${oldVal}, dp[${j}] + 1) = ${dp[i]}。`,
            log: `j=${j}: s[${j + 1}..${i}]回文，dp[${i}]从 ${oldVal} 更新为 ${dp[i]}`,
            codeLine: PALINDROME_PARTITION_CODE_LINES.update,
          });
        }
      }
    }
  }

  steps.push({
    s,
    isPal,
    dp: [...dp],
    currentI: n - 1,
    currentJ: -1,
    phase: 'finish',
    message: `全字符串计算完毕！将 "${s}" 全部切分为回文子串的最少分割次数为 ${dp[n - 1]} 刀。`,
    log: `算法收敛完成，最少分割次数=${dp[n - 1]}`,
    codeLine: PALINDROME_PARTITION_CODE_LINES.finish,
  });

  return steps;
}
