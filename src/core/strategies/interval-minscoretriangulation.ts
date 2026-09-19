import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 多边形三角剖分的最低得分 (Minimum Score Triangulation, LC 1039, 左程云 84 课)
 * 凸多边形区间 DP：
 * 顶点顺时针/逆时针排列，以固定边 (i, j) 为底边，枚举中间顶点 k 构造三角形 (i, k, j)。
 * 状态定义：dp[i][j] 表示凸子多边形 [i..j] 剖分为三角形的最低得分总和。
 * 转移方程：dp[i][j] = min_{k \in (i, j)} (dp[i][k] + dp[k][j] + values[i] * values[k] * values[j])
 */
export function compileMinScoreTriangulation(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const values: number[] = (params.params?.values as number[]) || [1, 2, 3];
  const n = values.length;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineGuardLess = anchorMap?.guard_less || 4;
  const lineInitDp = anchorMap?.init_dp || 5;
  const lineLoopLen = anchorMap?.loop_len || 6;
  const lineLoopI = anchorMap?.loop_i || 7;
  const lineCalcJ = anchorMap?.calc_j || 8;
  const lineInitMin = anchorMap?.init_min || 9;
  const lineLoopK = anchorMap?.loop_k || 10;
  const lineCalcTri = anchorMap?.calc_tri || 11;
  const lineCalcScore = anchorMap?.calc_score || 12;
  const lineUpdateMin = anchorMap?.update_min || 13;
  const lineTransfer = anchorMap?.transfer || 15;
  const lineReturn = anchorMap?.return || 18;

  const steps: UniversalStep[] = [];

  // 二维表格初始化：大小 n * n
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  // Step 0: 函数入口帧
  steps.push({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    tag: `minScoreTriangulation(values) 顶点数 n=${n}`,
    log: `🎯 进入 minScoreTriangulation：多边形顶点 values=[${values.join(', ')}]`,
    msg: `主函数入口：给定 <code>${n}</code> 边形凸多边形顶点权值 <code>[${values.join(', ')}]</code>。求剖分为若干三角形的最低总得分。`,
  });

  // Step 1: 顶点数特判
  if (n < 3) {
    steps.push({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineGuardLess,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(grid),
      dp1d: [...values],
      memo: {},
      activeSlot: 0,
      tag: '顶点数 < 3，返回 0',
      log: '| 无法构成任何三角形，返回 0',
      msg: '顶点少于 3 个，无法构成任何三角形，最低得分为 <strong>0</strong>。',
    });
    return steps;
  }

  // Step 2: 分配 DP 表格
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp[${n}][${n}] 状态矩阵`,
    log: `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示子多边形 [i..j] 剖分最小总得分`,
    msg: `分配状态表 <code>dp = new int[${n}][${n}]</code>。相邻点及自身（长度 $\\le 2$）无法构成三角形，初始值为 0。`,
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i + 1 && j < n; j++) {
      grid[i]![j] = 0; // 点数 < 3 无法构成三角形，得分为 0
    }
  }

  steps.push({
    type: 'init_val',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    tag: '基础条件: 顶点数 < 3 得分 0',
    log: '| 📋 顶点跨度 <= 2 无法构成三角形，初始化为 0',
    msg: '基础条件：区间顶点数少于 3 个（无法构成任何三角形），得分记为 <code>0</code>。',
  });

  // Step 3: 按顶点跨度 len 从 3 到 n 递推
  for (let len = 3; len <= n; len++) {
    steps.push({
      type: 'loop_len',
      flowPhase: 'forward',
      line: lineLoopLen,
      i: 0,
      j: len - 1,
      grid: snapshotGrid2D(grid),
      dp1d: [...values],
      memo: {},
      activeSlot: len,
      tag: `--- 递推顶点跨度 len = ${len} ---`,
      log: `| 📐 计算所有包含 ${len} 个顶点的凸子多边形剖分`,
      msg: `外层递推推进：当前考察跨度包含 <code>${len}</code> 个顶点的凸多边形。`,
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      let minScore = Infinity;
      let bestK = -1;

      // 枚举以 (i, j) 为底边的第三个顶点 k ∈ (i, j)
      for (let k = i + 1; k < j; k++) {
        const tri = values[i]! * values[k]! * values[j]!;
        const leftScore = grid[i]![k] ?? 0;
        const rightScore = grid[k]![j] ?? 0;
        const score = leftScore + rightScore + tri;
        if (score < minScore) {
          minScore = score;
          bestK = k;
        }
      }

      grid[i]![j] = minScore;

      steps.push({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        grid: snapshotGrid2D(grid),
        dp1d: [...values],
        memo: {},
        activeSlot: j,
        gridHighlight: { i, j },
        deps: bestK !== -1 ? [
          { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
          { r: bestK, c: j, type: 'bottom' as any, label: `dp[${bestK}][${j}]=${grid[bestK]![j]}` },
        ] : [],
        tag: `多边形 [${i}..${j}] 最优三角形: (${i}, ${bestK}, ${j}), dp[${i}][${j}] = ${minScore}`,
        log: `| 🔺 多边形 [${i}..${j}]：以边(${i},${j})和顶点${bestK}构三角(${values[i]}*${values[bestK]}*${values[j]}=${values[i]!*values[bestK]!*values[j]!}) ➔ 最低得分 dp[${i}][${j}] = ${minScore}`,
        msg: `计算凸多边形 <code>[${i}..${j}]</code>：选取顶点 <code>${bestK}</code> 构成三角形最优，三角得分 <code>${values[i]} × ${values[bestK]} × ${values[j]} + dp[${i}][${bestK}] + dp[${bestK}][${j}] = <strong>${minScore}</strong></code>。`,
      });
    }
  }

  // Step 4: 全局收敛返回
  const ans = grid[0]![n - 1] ?? 0;
  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `🎉 凸多边形三角剖分最低得分: ${ans}`,
    log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${ans}`,
    msg: `🎉 推导完成！凸 <code>${n}</code> 边形三角剖分的最低可能总得分为 <strong>${ans}</strong>。`,
  });

  return steps;
}
