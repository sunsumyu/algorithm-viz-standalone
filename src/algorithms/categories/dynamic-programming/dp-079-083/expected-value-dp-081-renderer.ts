/**
 * Class 081: 期望 DP 与马尔可夫决策过程 (Expected Value DP)
 * 棋盘走日等权全概率扩散与留存期望 / LeetCode 688
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { EXPECTED_VALUE_DP_081_CODES, EXPECTED_VALUE_DP_081_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderExpectedValueDpBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';
import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';

export interface ExpectedValue081Step extends Dp079Step {
  grid: number[][];
  step: number;
  totalProb: number;
}

export interface ExpectedValue081Input {
  n?: number;
  k?: number;
  row?: number;
  column?: number;
}

export function buildExpectedValue081Steps(input?: ExpectedValue081Input): ExpectedValue081Step[] {
  const steps: ExpectedValue081Step[] = [];
  const lines = EXPECTED_VALUE_DP_081_LINES;

  const n = input?.n !== undefined ? input.n : 3;
  const k = input?.k !== undefined ? input.k : 2;
  const startRow = input?.row !== undefined ? input.row : 0;
  const startCol = input?.column !== undefined ? input.column : 0;

  const dirs = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2],  [1, 2],
    [2, -1],  [2, 1],
  ];

  let dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0.0));
  if (startRow >= 0 && startRow < n && startCol >= 0 && startCol < n) {
    dp[startRow]![startCol] = 1.0;
  }

  function sumGrid(g: number[][]): number {
    return g.reduce((total, row) => total + row.reduce((s, val) => s + val, 0), 0);
  }

  // Step 0: 入口
  steps.push({
    grid: snapshotGrid2D(dp),
    step: 0,
    totalProb: 1.0,
    decision: `主函数入口：骑士位于 ${n}x${n} 棋盘的 (${startRow}, ${startCol})，要求走 K=${k} 步后留在棋盘上的概率。`,
    message: '马尔可夫决策过程无后效性：当前状态仅由上一时刻的全概率分布决定。',
    log: `enter knightProbability: n=${n}, k=${k}, start=(${startRow},${startCol})`,
    codeLine: lines.entry,
    metrics: { '棋盘规模': `${n}x${n}`, '总步数': k, '初始存活率': '100%' },
  });

  // Step 1: 起点初始化
  steps.push({
    grid: snapshotGrid2D(dp),
    step: 0,
    totalProb: 1.0,
    decision: `第 0 步初始态：起点 (${startRow}, ${startCol}) 概率设为 1.0，其余所有格子概率为 0。`,
    message: '初始化 DP 网格状态，准备启动逐层马尔可夫扩散。',
    log: `dp[0][${startRow}][${startCol}] = 1.0`,
    codeLine: lines.initStart,
    statusBadge: { text: '起点就绪', type: 'info' },
    metrics: { '起点位置': `(${startRow}, ${startCol})`, '初始概率': 1.0 },
  });

  for (let s = 1; s <= k; s++) {
    const nextDp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0.0));

    steps.push({
      grid: snapshotGrid2D(dp),
      step: s - 1,
      totalProb: sumGrid(dp),
      decision: `推进至第 ${s} 步全概率转移：考察盘内所有非零概率落点，向 8 个日字方向等权扩散。`,
      message: '每个有效格子按 1/8 概率均分给 8 个方向；若跳出棋盘，则该分支概率被边界吸收。',
      log: `step loop: step = ${s}`,
      codeLine: lines.stepLoop,
      statusBadge: { text: `第 ${s} 步扩散`, type: 'info' },
      metrics: { '当前步数': s, '上一轮存活率': `${(sumGrid(dp) * 100).toFixed(2)}%` },
    });

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (dp[r]![c]! > 0) {
          const probShare = dp[r]![c]! / 8.0;

          for (const d of dirs) {
            const nr = r + d[0]!;
            const nc = c + d[1]!;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
              nextDp[nr]![nc]! += probShare;
            }
          }
        }
      }
    }

    dp = nextDp;
    const currentProb = sumGrid(dp);

    steps.push({
      grid: snapshotGrid2D(dp),
      step: s,
      totalProb: currentProb,
      decision: `第 ${s} 步扩散计算完毕：全棋盘盘内剩余存活总概率为 ${(currentProb * 100).toFixed(4)}% (${currentProb})！`,
      message: `经 8 方向扩散与边界吸收后，盘内概率流转守恒，当前阶段累计存活率为 ${(currentProb * 100).toFixed(2)}%。`,
      log: `step ${s} completed -> alive prob = ${currentProb}`,
      codeLine: lines.probDist,
      statusBadge: { text: `第 ${s} 步: ${(currentProb * 100).toFixed(2)}%`, type: s === k ? 'success' : 'info' },
      metrics: { '当前步数': s, '存活概率': `${(currentProb * 100).toFixed(4)}%` },
    });
  }

  const finalProb = sumGrid(dp);

  // 终结汇总帧
  steps.push({
    grid: snapshotGrid2D(dp),
    step: k,
    totalProb: finalProb,
    decision: `全量马尔可夫决策终结：走完 ${k} 步后骑士留在 ${n}x${n} 棋盘上的最终概率为 ${(finalProb * 100).toFixed(4)}% (${finalProb})！`,
    message: '期望 DP 将指数级增长的分支路径合并至 O(K * N^2) 的紧致网格状态，精准规避重复计算。',
    log: `knightProbability complete -> return ${finalProb}`,
    codeLine: lines.sumResult,
    statusBadge: { text: `最终概率: ${(finalProb * 100).toFixed(2)}%`, type: 'success' },
    metrics: { '最终存活率': `${(finalProb * 100).toFixed(4)}%`, '时间复杂度': 'O(K * N^2)' },
  });

  return steps;
}

export const expectedValueDp081Visualizer = registerDeclarativeAlgorithm<ExpectedValue081Step>({
  id: 'expected-value-dp-081',
  name: '期望 DP 与马尔可夫决策 (Class 081)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  problemContent: DP_079_083_PROBLEMS.expectedValueDp081,
  sourceCodes: EXPECTED_VALUE_DP_081_CODES,
  generateSteps: buildExpectedValue081Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderExpectedValueDpBoard(
          step.grid,
          step.step,
          step.totalProb
        )}
        ${renderFormulaCard(
          '全概率转移与期望线性方程',
          'dp[k][nr][nc] \\mathrel{+}= \\frac{1}{8} \\times dp[k-1][r][c] \\quad (\\forall (nr, nc) \\in \\text{valid})',
          '马尔可夫链的无后效性保证了当前状态的概率仅依赖于上一时刻的所有可能前驱；借助动态规划顺推累加，规避了深度优先暴力递归重复状态爆炸的瓶颈。'
        )}
      </div>
    `;
  },
});
