/**
 * Class 083: 四边形不等式与决策单调性优化 (Knuth's Quadrangle Inequality)
 * 石子合并与区间划分决策点严格单调区间剪枝 / 经典区间 DP
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { KNUTH_QUADRANGLE_083_CODES, KNUTH_QUADRANGLE_083_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderKnuthQuadrangleBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface Knuth083Step extends Dp079Step {
  stones: number[];
  i: number;
  j: number;
  optL: number;
  optR: number;
  bestK: number;
  minCost: number;
}

export function buildKnuth083Steps(): Knuth083Step[] {
  const steps: Knuth083Step[] = [];
  const lines = KNUTH_QUADRANGLE_083_LINES;

  const stones = [3, 2, 4, 1];
  // 长度为 1: opt[i][i] = i, dp[i][i] = 0
  // 长度为 2:
  // [0, 1]: k=0, cost = 0 + 0 + 5 = 5, opt[0][1]=0
  // [1, 2]: k=1, cost = 0 + 0 + 6 = 6, opt[1][2]=1
  // [2, 3]: k=2, cost = 0 + 0 + 5 = 5, opt[2][3]=2
  // 长度为 3:
  // [0, 2]: opt[0][1] <= k <= opt[1][2] -> 0 <= k <= 1. k=0: dp[0][0]+dp[1][2]+9=0+6+9=15; k=1: dp[0][1]+dp[2][2]+9=5+0+9=14 -> best k=1, cost=14, opt[0][2]=1
  // [1, 3]: opt[1][2] <= k <= opt[2][3] -> 1 <= k <= 2. k=1: dp[1][1]+dp[2][3]+7=0+5+7=12; k=2: dp[1][2]+dp[3][3]+7=6+0+7=13 -> best k=1, cost=12, opt[1][3]=1
  // 长度为 4:
  // [0, 3]: opt[0][2] <= k <= opt[1][3] -> 1 <= k <= 1! 决策点唯一确定为 k=1!
  // k=1: dp[0][1]+dp[2][3]+10 = 5 + 5 + 10 = 20 -> best k=1, cost=20

  // Step 0: 入口
  steps.push({
    stones,
    i: 0,
    j: 0,
    optL: 0,
    optR: 0,
    bestK: 0,
    minCost: 0,
    decision: '主函数入口：开始为石子数组 [3, 2, 4, 1] 求解最小合并代价，初始化单石子决策点 opt[i][i] = i。',
    message: '四边形不等式证明了决策单调性：opt[i][j-1] <= opt[i][j] <= opt[i+1][j]。',
    log: 'enter mergeStones: stones=[3, 2, 4, 1]',
    codeLine: lines.entry,
    metrics: { '石子堆数': 4, '状态': '初始化' },
  });

  // Step 1: 求解长度为 2 的小区间 [0, 1]
  steps.push({
    stones,
    i: 0,
    j: 1,
    optL: 0,
    optR: 0,
    bestK: 0,
    minCost: 5,
    decision: '计算长度为 2 的区间 [0, 1] (石子 3 和 2)：合并代价为 3 + 2 = 5，决策点 opt[0][1] = 0。',
    message: '区间 DP 由小区间向大区间递推。',
    log: 'len=2: [0, 1] cost=5, opt=0',
    codeLine: lines.updateOpt,
    statusBadge: { text: '区间 [0, 1] 完成', type: 'info' },
    metrics: { '长度': 2, '区间': '[0, 1]', '最优代价': 5 },
  });

  // Step 2: 求解长度为 3 的区间 [0, 2]
  steps.push({
    stones,
    i: 0,
    j: 2,
    optL: 0,
    optR: 1,
    bestK: 1,
    minCost: 14,
    decision: '计算长度为 3 的区间 [0, 2]：Knuth 决策范围锁定在 [opt[0][1], opt[1][2]] = [0, 1]！',
    message: '枚举 k=0 (cost=15) 与 k=1 (cost=14)，选定最优决策点 k=1，最小代价 14。',
    log: 'len=3: [0, 2] k in [0, 1] -> best k=1, cost=14',
    codeLine: lines.knuthRange,
    statusBadge: { text: '剪枝范围 [0, 1]', type: 'info' },
    metrics: { '长度': 3, '区间': '[0, 2]', '最优代价': 14 },
  });

  // Step 3: 求解全局区间 [0, 3] 决策点奇迹收敛！
  steps.push({
    stones,
    i: 0,
    j: 3,
    optL: 1,
    optR: 1,
    bestK: 1,
    minCost: 20,
    decision: '计算跨越全数组的最终区间 [0, 3]：Knuth 剪枝范围被夹逼在 [opt[0][2], opt[1][3]] = [1, 1]！',
    message: '搜索范围收敛为一个单点 k=1！仅需评估 1 次，dp[0][3] = dp[0][1] + dp[2][3] + 10 = 5 + 5 + 10 = 20！',
    log: 'len=4: [0, 3] k in [1, 1] (Single point!) -> cost=20',
    codeLine: lines.returnAns,
    statusBadge: { text: '全局最优代价: 20', type: 'success' },
    metrics: { '最终代价': 20, '复杂度': 'O(N^2)' },
  });

  return steps;
}

export const knuthQuadrangle083Visualizer = registerDeclarativeAlgorithm<Knuth083Step>({
  id: 'knuth-quadrangle-inequality-083',
  name: '四边形不等式优化 (Class 083)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_079_083_PROBLEMS.knuthQuadrangle083,
  sourceCodes: KNUTH_QUADRANGLE_083_CODES,
  generateSteps: buildKnuth083Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderKnuthQuadrangleBoard(
          step.stones,
          step.i,
          step.j,
          step.optL,
          step.optR,
          step.bestK,
          step.minCost
        )}
        ${renderFormulaCard(
          'Knuth 决策单调性夹逼定理',
          'opt[i][j-1] \\le opt[i][j] \\le opt[i+1][j]',
          '代价函数满足四边形不等式使得决策点单调递增，计算 $dp[i][j]$ 时 $k$ 的枚举范围被左右两端子区间的决策点紧紧夹逼。所有区间的决策枚举跨度累加相消，将原本 $O(N^3)$ 的区间 DP 严格降至 $O(N^2)$。'
        )}
      </div>
    `;
  },
});
