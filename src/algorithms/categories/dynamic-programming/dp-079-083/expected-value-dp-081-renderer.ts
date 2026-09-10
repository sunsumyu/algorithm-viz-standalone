/**
 * Class 081: 期望 DP 与马尔可夫决策过程 (Expected Value DP)
 * 棋盘走日等权全概率扩散与留存期望 / LeetCode 688
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { EXPECTED_VALUE_DP_081_CODES, EXPECTED_VALUE_DP_081_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderExpectedValueDpBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ExpectedValue081Step extends Dp079Step {
  grid: number[][];
  step: number;
  totalProb: number;
}

export function buildExpectedValue081Steps(): ExpectedValue081Step[] {
  const steps: ExpectedValue081Step[] = [];
  const lines = EXPECTED_VALUE_DP_081_LINES;

  const n = 3;

  // Step 0: 初始状态 (0 步)
  const g0 = [
    [1.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
  ];
  steps.push({
    grid: g0,
    step: 0,
    totalProb: 1.0,
    decision: '主函数入口：骑士位于 3x3 棋盘左上角 (0, 0)，要求走 K=2 步后留在棋盘上的概率。',
    message: '第 0 步：起点初始概率为 1.0，其余格子概率为 0。',
    log: 'enter knightProbability: n=3, k=2, start=(0,0)',
    codeLine: lines.initStart,
    metrics: { '棋盘规模': '3x3', '步数限制': 2, '当前存活率': '100%' },
  });

  // Step 1: 走第 1 步
  // 从 (0, 0) 走日，8 个方向中合法落点只有 (1, 2) 和 (2, 1)，各占 1/8 = 0.125
  // 其余 6 个方向出界，留在棋盘总概率 = 2/8 = 0.25
  const g1 = [
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.125],
    [0.0, 0.125, 0.0],
  ];
  steps.push({
    grid: g1,
    step: 1,
    totalProb: 0.25,
    decision: '走第 1 步：骑士向 8 个日字方向转移，仅 (1, 2) 和 (2, 1) 合法在盘内，各获得 0.125 概率！',
    message: '其余 6 个方向出界，留在棋盘上的概率为 0.125 + 0.125 = 0.25。',
    log: 'step 1 complete: valid pos=(1,2) and (2,1), total=0.25',
    codeLine: lines.probDist,
    statusBadge: { text: '第 1 步存活: 25%', type: 'info' },
    metrics: { '步数': 1, '盘内概率': '25.00%' },
  });

  // Step 2: 走第 2 步
  // 从 (1, 2) 和 (2, 1) 各自继续走日
  // (1, 2) 合法跳点：(0, 0)[出界率极高，合法跳点也是少数]
  // 计算最终总概率为 0.0625
  const g2 = [
    [0.03125, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.03125],
  ];
  steps.push({
    grid: g2,
    step: 2,
    totalProb: 0.0625,
    decision: '走第 2 步：马尔可夫决策继续等权扩散，盘内剩余有效落点为 (0,0) 与 (2,2)。',
    message: '汇总全棋盘存活概率：0.03125 + 0.03125 = 0.0625 (即 1/16)。',
    log: 'step 2 complete: total prob=0.0625',
    codeLine: lines.sumResult,
    statusBadge: { text: '第 2 步存活: 6.25%', type: 'success' },
    metrics: { '步数': 2, '最终存活率': '6.25%' },
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
