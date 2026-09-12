/**
 * 基础线性 DP 统一步骤矩阵编译器 — Stage 4：空间压缩与滚动变量（O(1) 空间优化）
 * 从 linear-step-matrix-compiler 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export function compileLinearStage4(
  model: IYamlAlgorithmModel,
  nVal: number,
  anchorMap?: Record<string, number>
): UniversalStep[] {
  const modelId = model.id;
  const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), 10);
  const steps: UniversalStep[] = [];

  const lineInit = anchorMap?.init || 3;
  const lineAccumulate = anchorMap?.accumulate || 5;
  const lineFetchDown = anchorMap?.fetch_down || 6;
  const lineFetchRight = anchorMap?.fetch_right || 7;
  const lineReturn = anchorMap?.return || 9;

  let p = modelId === 'fibonacci' ? 0 : 1;
  let q = 1;

  steps.push({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    activeSlot: 0,
    down: p,
    right: q,
    memoj: p,
    tag: '初始化滚动变量',
    log: `| 📦 初始化滚动状态: p = ${p}, q = ${q} [空间复杂度 O(1)]`,
    msg: `初始化双滚动变量 <code>p = ${p}, q = ${q}</code>，空间复杂度降至 <strong>O(1)</strong>。`
  });

  for (let i = 2; i <= n; i++) {
    let r = p + q;
    if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
      const cost = [10, 15, 20, 25, 30];
      r = Math.min(q + (cost[i - 1] || 10), p + (cost[i - 2] || 15));
    }

    steps.push({
      type: 'accumulate',
      line: lineAccumulate,
      i,
      j: 0,
      activeSlot: i,
      slotMode: 'updated',
      down: p,
      right: q,
      memoj: r,
      tag: `计算当前值 i=${i}`,
      log: `| ✨ 计算当前项: r = ${r}`,
      msg: `计算当前项：<code>r = <strong>${r}</strong></code>。`
    });

    p = q;
    steps.push({
      type: 'fetch-down',
      line: lineFetchDown,
      i,
      j: 0,
      activeSlot: i,
      slotMode: 'down',
      down: p,
      right: q,
      memoj: r,
      tag: '滑动更新 p = q',
      log: `| ⬇️ 滑动状态: p = q (${p})`,
      msg: `滚动变量前移：<code>p = q (${p})</code>。`
    });

    q = r;
    steps.push({
      type: 'fetch-right',
      line: lineFetchRight,
      i,
      j: 0,
      activeSlot: i,
      slotMode: 'right',
      down: p,
      right: q,
      memoj: q,
      tag: '滑动更新 q = r',
      log: `| ➡️ 滑动状态: q = r (${q})`,
      msg: `滚动变量前移：<code>q = r (${q})</code>。`
    });
  }

  steps.push({
    type: 'return',
    line: lineReturn,
    i: n,
    j: 0,
    activeSlot: n,
    slotMode: 'final',
    down: p,
    right: q,
    memoj: q,
    tag: '最终答案',
    log: `| 🏆 O(1) 滚动完成！最终答案 = ${q}`,
    msg: `🏆 O(1) 滚动压缩计算完成！最终结果: <strong>${q}</strong>。`
  });

  return steps;
}

/**
 * Stage 5: 数学封闭解与极限进阶推导
 */
