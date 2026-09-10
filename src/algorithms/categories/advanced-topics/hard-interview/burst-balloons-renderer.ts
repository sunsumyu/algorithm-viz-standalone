/**
 * 大厂高频真题 05: 戳气球 (Burst Balloons)
 * LeetCode 312 / 顶级区间动态规划压轴题
 * 逆向思维：枚举区间内【最后一个戳破】的气球
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
    codeLine: 4,
    statusBadge: { text: '初始化', type: 'info' }
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
          codeLine: 14,
          statusBadge: isBest ? { text: `刷新得分: ${score}`, type: 'success' } : { text: `尝试 k=${k}`, type: 'info' }
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
    codeLine: 20,
    statusBadge: { text: `最大得分: ${dp[1][n]}`, type: 'success' }
  });

  return steps;
}

export function renderBurstBalloonsSandbox(step: BalloonStep): string {
  const balloonsHtml = step.val.map((v, idx) => {
    const isGuard = idx === 0 || idx === step.n + 1;
    const inRange = idx >= step.i && idx <= step.j;
    const isK = idx === step.k;
    const isBoundaryLeft = idx === step.i - 1;
    const isBoundaryRight = idx === step.j + 1;

    let bg = '#ffffff';
    let border = '#cbd5e1';
    let textColor = '#0f172a';

    if (isGuard) {
      bg = '#f1f5f9';
      border = '#94a3b8';
      textColor = '#64748b';
    } else if (isK) {
      bg = '#fef3c7';
      border = '#f59e0b';
      textColor = '#b45309';
    } else if (inRange) {
      bg = '#e0f2fe';
      border = '#38bdf8';
      textColor = '#0369a1';
    } else if (isBoundaryLeft || isBoundaryRight) {
      bg = '#dcfce7';
      border = '#22c55e';
      textColor = '#15803d';
    }

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; margin:3px 6px;">
        <div style="width:48px; height:48px; border-radius:50%; background:${bg}; border:2px solid ${border}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; color:${textColor}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
          ${v}
        </div>
        <span style="font-size:10px; color:#64748b; margin-top:3px;">
          ${isGuard ? '守卫' : `#${idx}`}
        </span>
        <span style="font-size:9px; height:12px; margin-top:1px;">
          ${isK ? '<b style="color:#d97706;">最后戳</b>' : isBoundaryLeft ? '<span style="color:#16a34a;">左邻</span>' : isBoundaryRight ? '<span style="color:#16a34a;">右邻</span>' : ''}
        </span>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 气球阵列物理沙盘 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:13px; color:#0f172a;">
            🎈 气球拓扑阵列 (当前考察区间 [${step.i} .. ${step.j}])
          </span>
          <div style="display:flex; gap:8px; font-size:11px;">
            <span style="color:#16a34a; font-weight:700;">■ 边界守护气球</span>
            <span style="color:#d97706; font-weight:700;">■ 最后戳破气球 (k)</span>
          </div>
        </div>
        <div style="display:flex; justify-content:center; align-items:center; overflow-x:auto; padding:8px 0;">
          ${balloonsHtml}
        </div>
      </div>

      <!-- 运算状态看板 -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前区间 [i, j]</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">[${step.i}, ${step.j}]</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">最后戳破气球 k</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">${step.k ?? '-'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">本方案得分</div>
          <div style="font-size:16px; font-weight:800; color:#0284c7;">${step.curScore ?? '-'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">区间最优得分</div>
          <div style="font-size:18px; font-weight:800; color:#15803d;">${step.dp[step.i]?.[step.j] ?? 0}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '戳气球逆向区间 DP 核心状态转移方程',
        'dp[i][j] = max( dp[i][k-1] + dp[k+1][j] + val[i-1] * val[k] * val[j+1] )',
        step.decision,
        step.statusBadge
      )}
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
  inputs: [],
  generateSteps: () => {
    return generateBurstBalloonsSteps([3, 1, 5, 8]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderBurstBalloonsSandbox(step)}
      </div>
    `;
  },
});
