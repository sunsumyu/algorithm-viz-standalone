/**
 * 大厂高频真题 05: 戳气球 (Burst Balloons)
 * LeetCode 312 / 顶级区间动态规划压轴题
 * 逆向思维：枚举区间内【最后一个戳破】的气球
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface BalloonStep extends StepBase {
  val: number[];
  n: number;
  i: number;
  j: number;
  k?: number;
  dp: number[][];
  bestK?: number;
  curScore?: number;
  maxScore: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const BURST_BALLOONS_CODES = {
  java: `public class BurstBalloons {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] val = new int[n + 2];
        val[0] = val[n + 1] = 1;
        for (int i = 0; i < n; i++) val[i + 1] = nums[i];

        int[][] dp = new int[n + 2][n + 2];
        // 逆向区间 DP：len 从 1 到 n
        for (int len = 1; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                for (int k = i; k <= j; k++) {
                    int score = dp[i][k - 1] + dp[k + 1][j] + val[i - 1] * val[k] * val[j + 1];
                    dp[i][j] = Math.max(dp[i][j], score);
                }
            }
        }
        return dp[1][n];
    }
}`,
  cpp: `class Solution {
public:
    int maxCoins(vector<int>& nums) {
        int n = nums.size();
        vector<int> val(n + 2, 1);
        for (int i = 0; i < n; i++) val[i + 1] = nums[i];
        vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));

        for (int len = 1; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                for (int k = i; k <= j; k++) {
                    int score = dp[i][k - 1] + dp[k + 1][j] + val[i - 1] * val[k] * val[j + 1];
                    dp[i][j] = max(dp[i][j], score);
                }
            }
        }
        return dp[1][n];
    }
};`,
  python: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        val = [1] + nums + [1]
        n = len(nums)
        dp = [[0] * (n + 2) for _ in range(n + 2)]

        for length in range(1, n + 1):
            for i in range(1, n - length + 2):
                j = i + length - 1
                for k in range(i, j + 1):
                    score = dp[i][k - 1] + dp[k + 1][j] + val[i - 1] * val[k] * val[j + 1]
                    if score > dp[i][j]:
                        dp[i][j] = score
        return dp[1][n]`,
  typescript: `export function maxCoins(nums: number[]): number {
  const n = nums.length;
  const val = [1, ...nums, 1];
  const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      for (let k = i; k <= j; k++) {
        const score = dp[i][k - 1] + dp[k + 1][j] + val[i - 1] * val[k] * val[j + 1];
        dp[i][j] = Math.max(dp[i][j], score);
      }
    }
  }
  return dp[1][n];
}`
};

export const BURST_BALLOONS_CODE_LINES = {
  init: { java: 4, cpp: 5, python: 3, typescript: 3 },
  calc: { java: 13, cpp: 13, python: 11, typescript: 10 },
  finish: { java: 18, cpp: 18, python: 14, typescript: 15 },
};

export function generateBurstBalloonsSteps(rawNums: number[] = [3, 1, 5, 8]): BalloonStep[] {
  const steps: BalloonStep[] = [];
  const n = rawNums.length;
  const val = [1, ...rawNums, 1];
  const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));

  steps.push({
    val: [...val],
    n,
    i: 0,
    j: 0,
    dp: dp.map(r => [...r]),
    maxScore: 0,
    decision: '初始化气球序列与左右虚拟保护边界',
    message: `原始气球 [${rawNums.join(', ')}]，左右各补充虚拟保护气球 1，扩展为 [${val.join(', ')}]。`,
    log: `Init burst balloons (n=${n})`,
    codeLine: BURST_BALLOONS_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      interval: '就绪',
      lastBalloon: '-',
      curScore: 0,
      maxCoins: 0,
    },
    ans: '0',
  });

  for (let len = 1; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;

      for (let k = i; k <= j; k++) {
        const burstGain = val[i - 1] * val[k] * val[j + 1];
        const score = dp[i][k - 1] + dp[k + 1][j] + burstGain;

        const isBest = score > dp[i][j];
        if (isBest) {
          dp[i][j] = score;
        }

        steps.push({
          val: [...val],
          n,
          i,
          j,
          k,
          dp: dp.map(r => [...r]),
          bestK: k,
          curScore: score,
          maxScore: dp[1][n],
          decision: `区间 [${i}..${j}]：假设最后戳破气球 #${k}(值=${val[k]})，得分 = ${dp[i][k - 1]} + ${dp[k + 1][j]} + (${val[i - 1]}*${val[k]}*${val[j + 1]}) = ${score}`,
          message: `气球 #${k} 最后被戳破，左右相邻气球必定是边界 #${i - 1}(${val[i - 1]}) 与 #${j + 1}(${val[j + 1]})！${isBest ? '🎉 刷新区间最高得分！' : ''}`,
          log: `dp[${i}][${j}] try k=${k} -> ${score}`,
          codeLine: BURST_BALLOONS_CODE_LINES.calc,
          statusBadge: isBest ? { text: `刷新得分: ${score}`, type: 'success' } : { text: `尝试 k=${k}`, type: 'info' },
          metrics: {
            interval: `[${i}, ${j}]`,
            lastBalloon: `#${k} (${val[k]})`,
            curScore: score,
            maxCoins: dp[1][n],
          },
          ans: String(dp[1][n]),
        });
      }
    }
  }

  steps.push({
    val: [...val],
    n,
    i: 1,
    j: n,
    dp: dp.map(r => [...r]),
    maxScore: dp[1][n],
    decision: `区间 DP 计算完成！全局能够获得的最大金币数 = ${dp[1][n]}`,
    message: `考虑全部气球区间 [1..${n}]，最终状态 dp[1][${n}] = ${dp[1][n]}。`,
    log: `Finished. maxCoins = ${dp[1][n]}`,
    codeLine: BURST_BALLOONS_CODE_LINES.finish,
    statusBadge: { text: `最大得分: ${dp[1][n]}`, type: 'success' },
    metrics: {
      interval: `[1, ${n}]`,
      lastBalloon: '全部结算',
      curScore: dp[1][n],
      maxCoins: dp[1][n],
    },
    ans: String(dp[1][n]),
  });

  return steps;
}

export function renderBurstBalloonsSandbox(step: BalloonStep): string {
  const balloonsHtml = step.val.map((v, idx) => {
    const isGuard = idx === 0 || idx === step.n + 1;
    const inRange = idx >= step.i && idx <= step.j && step.i > 0;
    const isK = idx === step.k;
    const isBoundaryLeft = step.i > 0 && idx === step.i - 1;
    const isBoundaryRight = step.i > 0 && idx === step.j + 1;

    let bg = 'rgba(255, 255, 255, 0.05)';
    let border = 'rgba(255, 255, 255, 0.15)';
    let textColor = 'var(--text-color, #e2e8f0)';

    if (isGuard) {
      bg = 'rgba(100, 116, 139, 0.15)';
      border = 'rgba(148, 163, 184, 0.4)';
      textColor = 'var(--text-muted, #94a3b8)';
    } else if (isK) {
      bg = 'rgba(245, 158, 11, 0.25)';
      border = '#f59e0b';
      textColor = '#fbbf24';
    } else if (inRange) {
      bg = 'rgba(56, 189, 248, 0.18)';
      border = '#38bdf8';
      textColor = '#38bdf8';
    } else if (isBoundaryLeft || isBoundaryRight) {
      bg = 'rgba(34, 197, 94, 0.2)';
      border = '#22c55e';
      textColor = '#4ade80';
    }

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; margin:4px 8px;">
        <div style="
          width:52px; height:52px; border-radius:50%; background:${bg}; border:2px solid ${border};
          display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; color:${textColor};
          box-shadow:${isK ? '0 0 14px rgba(245, 158, 11, 0.5)' : 'none'}; transition:all 0.2s ease;
        ">
          ${v}
        </div>
        <span style="font-size:11px; color:var(--text-muted, #94a3b8); margin-top:4px; font-weight:600;">
          ${isGuard ? '边界守卫' : `#${idx}`}
        </span>
        <span style="font-size:10px; height:14px; margin-top:2px;">
          ${isK ? '<b style="color:#f59e0b;">最后戳</b>' : isBoundaryLeft ? '<span style="color:#4ade80;">左边界</span>' : isBoundaryRight ? '<span style="color:#4ade80;">右边界</span>' : ''}
        </span>
      </div>
    `;
  }).join('');

  // 渲染区间 DP 状态矩阵
  const n = step.n;
  const headerCols = Array.from({ length: n }, (_, idx) => `<th style="padding:6px; color:var(--text-muted, #94a3b8); font-size:11px; text-align:center;">j=${idx + 1}</th>`).join('');
  const matrixRows = Array.from({ length: n }, (_, r) => {
    const rowIdx = r + 1;
    const cells = Array.from({ length: n }, (_, c) => {
      const colIdx = c + 1;
      const isCurrentCell = rowIdx === step.i && colIdx === step.j;
      const isTargetCell = rowIdx === 1 && colIdx === n;
      const val = step.dp[rowIdx]?.[colIdx] ?? 0;
      const isValid = rowIdx <= colIdx;

      let cellBg = 'rgba(255, 255, 255, 0.02)';
      let cellBorder = '1px solid rgba(255, 255, 255, 0.06)';
      let cellColor = isValid ? (val > 0 ? '#4ade80' : 'var(--text-muted, #64748b)') : 'rgba(255, 255, 255, 0.05)';

      if (isCurrentCell) {
        cellBg = 'rgba(245, 158, 11, 0.25)';
        cellBorder = '2px solid #f59e0b';
        cellColor = '#fef08a';
      } else if (isTargetCell && val > 0) {
        cellBg = 'rgba(34, 197, 94, 0.2)';
        cellBorder = '1px solid #22c55e';
      }

      return `
        <td style="
          padding: 8px 12px; text-align:center; font-family:monospace; font-size:12px; font-weight:700;
          background:${cellBg}; border:${cellBorder}; color:${cellColor};
        ">
          ${isValid ? val : '-'}
        </td>
      `;
    }).join('');

    return `
      <tr>
        <td style="padding:6px 10px; font-size:11px; font-weight:600; color:var(--text-muted, #94a3b8); text-align:right;">i=${rowIdx}</td>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:16px; width:100%; height:100%;">
      <!-- 气球阵列拓扑带 -->
      <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-weight:700; font-size:13px; color:var(--text-color, #f1f5f9);">
            🎈 气球拓扑阵列 (当前考察区间 [${step.i > 0 ? step.i : 1} .. ${step.j > 0 ? step.j : n}])
          </span>
          <div style="display:flex; gap:12px; font-size:11px;">
            <span style="color:#4ade80; font-weight:600;">■ 边界守护气球</span>
            <span style="color:#f59e0b; font-weight:600;">■ 最后戳破气球 (k)</span>
          </div>
        </div>
        <div style="display:flex; justify-content:center; align-items:center; overflow-x:auto; padding:6px 0;">
          ${balloonsHtml}
        </div>
      </div>

      <!-- 逆向区间 DP 状态转移矩阵 -->
      <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:14px; flex:1; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-weight:700; font-size:13px; color:#38bdf8;">
            📊 区间 DP 状态矩阵 dp[i][j] (自对角线向右上角展开)
          </span>
          <span style="font-size:11px; color:var(--text-muted, #94a3b8);">
            最终目标: dp[1][${n}]
          </span>
        </div>
        <div style="overflow-x:auto; flex:1;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:6px; font-size:11px; color:var(--text-muted, #94a3b8); text-align:right;">dp[i][j]</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>
              ${matrixRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export const burstBalloonsVisualizer = registerDeclarativeAlgorithm<BalloonStep>({
  id: 'burst-balloons',
  name: '大厂高频真题: 戳气球 (Burst Balloons)',
  category: 'dynamic-programming',
  icon: '🎈',
  difficulty: 3,
  levelOrder: 312,
  learningGoal: '深刻理解区间 DP 逆向思维，通过枚举最后戳破的气球消解子问题边界依赖',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 312)</h3>
      <p>有 <code>n</code> 个气球，编号为 <code>0</code> 到 <code>n - 1</code>，每个气球上都标有一个数字，这些数字存在数组 <code>nums</code> 中。</p>
      <p>现在要求你戳破所有的气球。戳破气球 <code>i</code> 可以获得 <code>nums[i - 1] * nums[i] * nums[i + 1]</code> 枚硬币。求所能获得硬币的最大数量。</p>
      <p><strong>逆向破局：</strong>正向戳破会导致左右气球重新相邻产生依赖耦合；若逆向假设 $k$ 是区间内最后一个戳破的气球，左右两边独立，状态转移迎刃而解！</p>
    </div>
  `,
  codeLanguages: BURST_BALLOONS_CODES,
  metrics: [
    { id: 'interval', label: '考察区间 [i, j]', color: '#38bdf8' },
    { id: 'lastBalloon', label: '最后戳破气球 k', color: '#f59e0b' },
    { id: 'curScore', label: '本方案得分', color: '#a855f7' },
    { id: 'maxCoins', label: '全局最大金币', color: '#10b981' },
  ],
  inputs: [],
  generateSteps: () => {
    return generateBurstBalloonsSteps([3, 1, 5, 8]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderBurstBalloonsSandbox(step);
  },
});
