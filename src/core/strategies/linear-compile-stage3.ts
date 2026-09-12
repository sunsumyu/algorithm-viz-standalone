/**
 * 基础线性 DP 统一步骤矩阵编译器 — Stage 3：一维 DP 状态表递推（自底向上填表与依赖高亮）
 * 从 linear-step-matrix-compiler 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { build1DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export function compileLinearStage3(
  model: IYamlAlgorithmModel,
  nVal: number,
  anchorMap?: Record<string, number>
): UniversalStep[] {
  const modelId = model.id;
  const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), 10);
  const steps: UniversalStep[] = [];
  const dp = new Array(n + 1).fill(null);

  const lineInit = anchorMap?.init || 3;
  const lineInitVal = anchorMap?.init_val || 4;
  const lineLoopInner = anchorMap?.loop_j || (anchorMap?.transfer ? anchorMap.transfer - 1 : 5);
  const lineTransfer = anchorMap?.transfer || 7;
  const lineReturn = anchorMap?.return || 9;

  // 为所有线性 DP 统一构建二维状态网格 (nCols 列排列)，将一维索引 k 映射为 (row, col)
  const nCols = Math.max(n + 1, 3); // 列数 = dp 数组长度
  const mRows = 1;                  // 单行展示
  const matrix2d: (number | null)[][] = [new Array(nCols).fill(null)];

  /** 将一维 dp 索引 k 映射为二维网格坐标 */
  const toRC = (k: number): { r: number; c: number } => ({ r: 0, c: Math.min(k, nCols - 1) });

  /** 同步 dp 数组到二维矩阵 */
  const syncMatrix = (): void => {
    for (let k = 0; k <= n; k++) {
      matrix2d[0][k] = dp[k];
    }
  };

  steps.push({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    grid: JSON.parse(JSON.stringify(matrix2d)),
    dp1d: [...dp],
    memo: [...dp],
    tag: '初始化 DP 数组',
    log: `| 📦 创建一维 DP 状态数组 dp[0..${n}]`,
    msg: `创建长度为 ${n + 1} 的一维 DP 数组，准备自底向上顺序填表。`
  });

  if (modelId === 'fibonacci') {
    dp[0] = 0;
    syncMatrix();
    const rc0 = toRC(0);
    steps.push({
      type: 'init-val',
      line: lineInitVal,
      i: rc0.r,
      j: rc0.c,
      activeSlot: 0,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: 'Base Case dp[0]=0',
      log: `| 🎬 初始化 Base Case: dp[0] = 0`,
      msg: `初始化 <code>dp[0] = 0</code>。`
    });
    if (n >= 1) {
      dp[1] = 1;
      syncMatrix();
      const rc1 = toRC(1);
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: rc1.r,
        j: rc1.c,
        activeSlot: 1,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'Base Case dp[1]=1',
        log: `| 🎬 初始化 Base Case: dp[1] = 1`,
        msg: `初始化 <code>dp[1] = 1</code>。`
      });
    }
    for (let i = 2; i <= n; i++) {
      const sum = dp[i - 1] + dp[i - 2];
      dp[i] = sum;
      syncMatrix();
      const rc = toRC(i);
      const rcPrev1 = toRC(i - 1);
      const rcPrev2 = toRC(i - 2);
      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i: rc.r,
        j: rc.c,
        topI: rcPrev2.r,
        topJ: rcPrev2.c,
        leftI: rcPrev1.r,
        leftJ: rcPrev1.c,
        activeSlot: i,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: `dp[${i}] = ${sum}`,
        log: `| 🔄 dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]}) = ${sum}`,
        msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = <strong>${sum}</strong></code>。`
      });
    }
  } else if (modelId === 'climb-stairs') {
    dp[0] = 1;
    dp[1] = 1;
    syncMatrix();
    steps.push({
      type: 'init-val',
      line: lineInitVal,
      i: 0,
      j: 0,
      activeSlot: 0,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: 'Base Case dp[0]=1',
      log: `| 🎬 初始化 Base Case: dp[0] = 1`,
      msg: `初始化 <code>dp[0] = 1</code>。`
    });
    if (n >= 1) {
      const rc1 = toRC(1);
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: rc1.r,
        j: rc1.c,
        activeSlot: 1,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'Base Case dp[1]=1',
        log: `| 🎬 初始化 Base Case: dp[1] = 1`,
        msg: `初始化 <code>dp[1] = 1</code>。`
      });
    }
    for (let i = 2; i <= n; i++) {
      const sum = dp[i - 1] + dp[i - 2];
      dp[i] = sum;
      syncMatrix();
      const rc = toRC(i);
      const rcPrev1 = toRC(i - 1);
      const rcPrev2 = toRC(i - 2);
      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i: rc.r,
        j: rc.c,
        topI: rcPrev2.r,
        topJ: rcPrev2.c,
        leftI: rcPrev1.r,
        leftJ: rcPrev1.c,
        activeSlot: i,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: `dp[${i}] = ${sum}`,
        log: `| 🔄 dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]}) = ${sum}`,
        msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = <strong>${sum}</strong></code>。`
      });
    }
  } else if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
    const cost = [10, 15, 20, 25, 30, 35, 40];
    dp[0] = 0;
    dp[1] = 0;
    syncMatrix();
    steps.push({
      type: 'init-val',
      line: lineInitVal,
      i: 0,
      j: 0,
      activeSlot: 0,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: 'dp[0]=0, dp[1]=0',
      log: `| 🎬 自由起跳: dp[0] = 0, dp[1] = 0`,
      msg: `初始化第 0 阶与第 1 阶自由起跳花费为 <code>0</code>。`
    });
    for (let i = 2; i <= n; i++) {
      const c1 = dp[i - 1] + (cost[i - 1] || 10);
      const c2 = dp[i - 2] + (cost[i - 2] || 15);
      dp[i] = Math.min(c1, c2);
      syncMatrix();
      const rc = toRC(i);
      const rcPrev1 = toRC(i - 1);
      const rcPrev2 = toRC(i - 2);
      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i: rc.r,
        j: rc.c,
        topI: rcPrev2.r,
        topJ: rcPrev2.c,
        leftI: rcPrev1.r,
        leftJ: rcPrev1.c,
        activeSlot: i,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: `dp[${i}] = ${dp[i]}`,
        log: `| 🔄 dp[${i}] = min(dp[${i - 1}]+cost[${i - 1}], dp[${i - 2}]+cost[${i - 2}]) = min(${c1}, ${c2}) = ${dp[i]}`,
        msg: `状态转移：<code>dp[${i}] = min(${c1}, ${c2}) = <strong>${dp[i]}</strong></code>。`
      });
    }
  } else if (modelId === 'integer-break') {
    dp[2] = 1;
    syncMatrix();
    const rcBase = toRC(2);
    steps.push({
      type: 'init-val',
      line: lineInitVal,
      i: rcBase.r,
      j: rcBase.c,
      activeSlot: 2,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: 'Base Case dp[2]=1',
      log: `| 🎬 初始化 Base Case: dp[2] = 1 (2=1+1, 1*1=1)`,
      msg: `初始化 <code>dp[2] = 1</code>。`
    });

    for (let i = 3; i <= n; i++) {
      let maxVal = 0;
      for (let j = 1; j <= Math.floor(i / 2); j++) {
        const cur = Math.max(j * (i - j), j * (dp[i - j] || 0));
        maxVal = Math.max(maxVal, cur);
      }
      dp[i] = maxVal;
      syncMatrix();
      const rc = toRC(i);
      const rcPrev = toRC(i - 1);
      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i: rc.r,
        j: rc.c,
        leftI: rcPrev.r,
        leftJ: rcPrev.c,
        activeSlot: i,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: `dp[${i}] = ${maxVal}`,
        log: `| 🔄 拆分整数 ${i}: 最大乘积 dp[${i}] = ${maxVal}`,
        msg: `状态转移：拆分正整数 <code>${i}</code> 获得最大乘积 <code>dp[${i}] = <strong>${maxVal}</strong></code>。`
      });
    }
  } else if (modelId === 'unique-bst') {
    dp[0] = 1;
    dp[1] = 1;
    syncMatrix();
    steps.push({
      type: 'init-val',
      line: lineInitVal,
      i: 0,
      j: 0,
      activeSlot: 0,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: 'dp[0]=1, dp[1]=1',
      log: `| 🎬 空树与单节点树基础形态: dp[0] = 1, dp[1] = 1`,
      msg: `初始化空树与单节点 BST 数量 <code>dp[0] = 1, dp[1] = 1</code>。`
    });
    for (let i = 2; i <= n; i++) {
      let total = 0;
      for (let j = 1; j <= i; j++) {
        total += (dp[j - 1] || 1) * (dp[i - j] || 1);
      }
      dp[i] = total;
      syncMatrix();
      const rc = toRC(i);
      const rcPrev = toRC(i - 1);
      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i: rc.r,
        j: rc.c,
        leftI: rcPrev.r,
        leftJ: rcPrev.c,
        activeSlot: i,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: `dp[${i}] = ${total}`,
        log: `| 🔄 ${i} 个节点 BST 笛卡尔积分形态: dp[${i}] = ${total}`,
        msg: `状态转移：<code>${i}</code> 个节点的不同二叉搜索树形态总数 <code>dp[${i}] = <strong>${total}</strong></code>。`
      });
    }
  }

  const rcFinal = toRC(n);
  steps.push({
    type: 'return',
    line: lineReturn,
    i: rcFinal.r,
    j: rcFinal.c,
    activeSlot: n,
    grid: JSON.parse(JSON.stringify(matrix2d)),
    dp1d: [...dp],
    memo: [...dp],
    tag: '最终答案',
    log: `| 🏆 填表计算完成！最终结果 dp[${n}] = ${dp[n]}`,
    msg: `🏆 递推填表完成！最终答案: <code>dp[${n}] = <strong>${dp[n]}</strong></code>。`
  });

  for (const step of steps) {
    step.treeRoot = build1DDPDependencyTree(n, modelId, step.dp1d, step.activeSlot ?? step.j);
    step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
  }

  return steps;
}

/**
 * Stage 4: 空间滚动压缩 (O(1) Rolling Variable Space)
 */
