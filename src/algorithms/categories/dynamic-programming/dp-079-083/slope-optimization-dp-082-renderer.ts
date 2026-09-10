/**
 * Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP)
 * 点斜式线性转化与下凸壳 O(N) 动态切线维护 / 洛谷 P2365
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { SLOPE_OPTIMIZATION_DP_082_CODES, SLOPE_OPTIMIZATION_DP_082_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderSlopeOptBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SlopeOpt082Step extends Dp079Step {
  points: { idx: number; x: number; y: number }[];
  hullIndices: number[];
  curSlope: number;
  bestJ: number;
  curDp: number;
}

export function buildSlopeOpt082Steps(): SlopeOpt082Step[] {
  const steps: SlopeOpt082Step[] = [];
  const lines = SLOPE_OPTIMIZATION_DP_082_LINES;

  // Step 0: 入口
  steps.push({
    points: [{ idx: 0, x: 0, y: 0 }],
    hullIndices: [0],
    curSlope: 0,
    bestJ: 0,
    curDp: 0,
    decision: '主函数入口：开始为任务安排问题求解最小总费用，初始决策点 P0(0, 0) 入单调队列。',
    message: '将 DP 状态改写为直线的点斜式 $Y = K \\cdot X + B$，截距 $B$ 即为待最小化的目标。',
    log: 'enter taskSchedule: initial point (0, 0) pushed to hull',
    codeLine: lines.entry,
    metrics: { '初始队列大小': 1, '凸包点数': 1 },
  });

  // Step 1: 处理 i=1
  steps.push({
    points: [
      { idx: 0, x: 0, y: 0 },
      { idx: 1, x: 2, y: 15 },
    ],
    hullIndices: [0, 1],
    curSlope: 3,
    bestJ: 0,
    curDp: 15,
    decision: '遍历 i=1：当前查询斜率 K=3，队列头 P0 与 P1 之间的线段斜率大于 3，P0 依然最优。',
    message: '计算得出 dp[1] = 15，生成新点 P1(2, 15) 满足下凸性，压入单调队列。',
    log: 'process i=1: best j=0, dp[1]=15, push P1',
    codeLine: lines.transOpt,
    statusBadge: { text: 'dp[1] = 15', type: 'info' },
    metrics: { '当前斜率 K': 3, '最优决策点': 0, 'dp[1]': 15 },
  });

  // Step 2: 处理 i=2 (斜率激增，队头淘汰 P0)
  steps.push({
    points: [
      { idx: 0, x: 0, y: 0 },
      { idx: 1, x: 2, y: 15 },
      { idx: 2, x: 5, y: 48 },
    ],
    hullIndices: [1, 2],
    curSlope: 8,
    bestJ: 1,
    curDp: 48,
    decision: '遍历 i=2：当前查询斜率 K=8，超过了 P0 到 P1 的切线斜率，P0 永远不再是最优，从队头弹出！',
    message: '最优决策点转移为 P1，计算得出 dp[2] = 48，新点 P2(5, 48) 入队。',
    log: 'process i=2: pop head P0, best j=1, dp[2]=48',
    codeLine: lines.popHead,
    statusBadge: { text: '队头淘汰 P0', type: 'warning' },
    metrics: { '当前斜率 K': 8, '最优决策点': 1, 'dp[2]': 48 },
  });

  // Step 3: 完成全部任务安排
  steps.push({
    points: [
      { idx: 0, x: 0, y: 0 },
      { idx: 1, x: 2, y: 15 },
      { idx: 2, x: 5, y: 48 },
      { idx: 3, x: 8, y: 89 },
    ],
    hullIndices: [1, 2, 3],
    curSlope: 14,
    bestJ: 2,
    curDp: 89,
    decision: '全量任务规划完成：终点最优总费用为 dp[3] = 89。',
    message: '单调队列动态维护下凸壳，将原本 O(N^2) 的二次规划直接缩减为严格的 O(N) 线性时间。',
    log: 'taskSchedule complete -> return 89',
    codeLine: lines.returnAns,
    statusBadge: { text: '最终最优费用: 89', type: 'success' },
    metrics: { '最终费用': 89, '时间复杂度': 'O(N)' },
  });

  return steps;
}

export const slopeOptDp082Visualizer = registerDeclarativeAlgorithm<SlopeOpt082Step>({
  id: 'slope-optimization-dp-082',
  name: '斜率优化 DP 与单调队列凸包 (Class 082)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_079_083_PROBLEMS.slopeOptDp082,
  sourceCodes: SLOPE_OPTIMIZATION_DP_082_CODES,
  generateSteps: buildSlopeOpt082Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderSlopeOptBoard(
          step.points,
          step.hullIndices,
          step.curSlope,
          step.bestJ,
          step.curDp
        )}
        ${renderFormulaCard(
          '点斜式下凸壳几何定理',
          '\\text{Slope}(j_1, j_2) = \\frac{Y_2 - Y_1}{X_2 - X_1} \\le K(i) \\implies j_1 \\text{ 恒劣于 } j_2',
          '通过将交叉乘积项改写为点斜式 $Y = K \\cdot X + B$，最优决策点必位于点集的下凸壳切点处。利用单调队列维护凸包相邻斜率递增性，实现均摊 $O(1)$ 的最优决策点查找与点入队维护。'
        )}
      </div>
    `;
  },
});
