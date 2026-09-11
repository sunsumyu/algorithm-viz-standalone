/**
 * 分割回文串 II (Palindrome Partitioning II)
 * LeetCode 132 (Hard / 大厂高频动态规划经典)
 * 核心原语:
 *  给你一个字符串 s，请你将 s 分割成一些子串，使每个子串都是回文串。
 *  返回符合要求的【最少分割次数】。
 *  两阶段动态规划：
 *   1. 预处理回文矩阵 isPal[i][j]，在 O(N^2) 内判定所有子串是否为回文。
 *   2. 线性 DP：dp[i] 表示前缀 s[0..i] 的最少分割次数。
 *      若 s[0..i] 本身是回文，则 dp[i] = 0；
 *      否则 dp[i] = min(dp[j] + 1)，其中 isPal[j+1][i] == true (0 <= j < i)。
 *  时间复杂度 O(N^2)，空间复杂度 O(N^2)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface PalindromePartitionStep extends StepBase {
  s: string;
  isPal: boolean[][];
  dp: number[];
  currentI: number;
  currentJ: number;
  phase: 'init' | 'check-full' | 'transition' | 'finish';
  message: string;
  log: string;
  codeLine: number;
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

  // Step 0: Init
  steps.push({
    s,
    isPal,
    dp: [...dp],
    currentI: 0,
    currentJ: -1,
    phase: 'init',
    message: `算法启动：原字符串 "${s}" (长 ${n})。完成子串回文矩阵 isPal 预处理，开始计算前缀最少分割 DP 数组。`,
    log: `回文矩阵就绪，分配 dp[0..${n - 1}]`,
    codeLine: 13,
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
        codeLine: 16,
      });
    } else {
      dp[i] = i; // 初始最多切 i 刀
      steps.push({
        s,
        isPal,
        dp: [...dp],
        currentI: i,
        currentJ: -1,
        phase: 'transition',
        message: `前缀 s[0..${i}] ("${s.slice(0, i + 1)}") 不是整体回文。初始化基线分割 dp[${i}] = ${i}，遍历前置分割点 j。`,
        log: `dp[${i}] 基线初值=${i}`,
        codeLine: 18,
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
            codeLine: 21,
          });
        }
      }
    }
  }

  // Finish
  steps.push({
    s,
    isPal,
    dp: [...dp],
    currentI: n - 1,
    currentJ: -1,
    phase: 'finish',
    message: `全字符串计算完毕！将 "${s}" 全部切分为回文子串的最少分割次数为 ${dp[n - 1]} 刀。`,
    log: `算法收敛完成，最少分割次数=${dp[n - 1]}`,
    codeLine: 26,
  });

  return steps;
}

function renderPalindromePartitionCanvas(step: PalindromePartitionStep): string {
  const { s, dp, currentI, currentJ, phase } = step;

  const charCards = s
    .split('')
    .map((ch, idx) => {
      const isCur = idx === currentI && phase !== 'finish';
      const isCutPoint = idx === currentJ;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (idx <= currentI) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px; position: relative;">
        ${isCutPoint ? '<div style="position: absolute; right: -8px; top: -6px; color: #ef4444; font-weight: 700; font-size: 14px;">✂</div>' : ''}
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
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // DP 数组展示
  const dpCells = dp
    .map((val, idx) => {
      const isCur = idx === currentI;
      let bg = 'rgba(255, 255, 255, 0.05)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(16, 185, 129, 0.3)';
        color = '#34d399';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 36px;
          background: ${bg};
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 15px;
        ">${idx <= currentI ? val : '—'}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">dp[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 字符串与切割指示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">目标字符串字符与动态切割点</div>
          <div style="font-size: 11px; color: #fbbf24;">当前前缀截止 i = ${currentI} ("${s.slice(0, currentI + 1)}")</div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 60px;">
          ${charCards}
        </div>
      </div>

      <!-- DP 转移数组面板 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 12px;">
          最少分割次数 DP 表 (dp[i] 代表前缀 s[0..i] 的最少切刀数)
        </div>
        <div style="display: flex; justify-content: center; align-items: center;">
          ${dpCells}
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前考察前缀右端 i</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentI}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">试探分割点 j</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${currentJ >= 0 ? currentJ : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前前缀最优刀数</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">${dp[currentI]} 刀</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最终最少分割</div>
          <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${dp[s.length - 1]} 刀</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'palindrome-partitioning-ii',
  name: '分割回文串 II',
  category: 'dynamic-programming',
  difficulty: 3,
  learningGoal: 'LeetCode 132: 将字符串分割为全回文串的最少分割次数。预处理 O(N^2) 回文判定矩阵，配合线性 DP 在 O(N^2) 内求得全局极值。',
  codeLanguages: PALINDROME_PARTITION_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.s as string | undefined;
    const s = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : 'aabcb';
    return buildPalindromePartitionSteps(s);
  },
  renderCanvas: (container: HTMLElement, step: PalindromePartitionStep) => {
    container.innerHTML = renderPalindromePartitionCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '输入待分割字符串',
      type: 'text',
      defaultValue: 'aabcb',
      placeholder: '例如: aabcb 或 aab',
    },
  ],
});
