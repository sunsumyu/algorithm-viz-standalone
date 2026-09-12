/**
 * 基础线性 DP 统一步骤矩阵编译器 — Stage 5：数学极值进阶与封闭解（矩阵快速幂 / 通项公式 / 贪心）
 * 从 linear-step-matrix-compiler 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export function compileLinearStage5(
  model: IYamlAlgorithmModel,
  nVal: number,
  anchorMap?: Record<string, number>
): UniversalStep[] {
  const modelId = model.id;
  const n = Math.min(Math.max(nVal || 5, 1), 10);
  const steps: UniversalStep[] = [];

  if (modelId === 'fibonacci' || modelId === 'climb-stairs') {
    // 矩阵快速幂推导
    steps.push({
      type: 'init',
      line: 1,
      i: 0,
      j: 0,
      tag: '矩阵快速幂 O(log N)',
      log: `| 📐 状态转移矩阵: [[1, 1], [1, 0]]^${n}`,
      msg: `使用矩阵快速幂，将状态转移转化为特征矩阵乘方，时间复杂度降至 <strong>O(log N)</strong>。`
    });
    steps.push({
      type: 'return',
      line: 5,
      i: n,
      j: 0,
      tag: '快速幂完成',
      log: `| 🏆 快速幂计算完成，直接输出结果`,
      msg: `🏆 矩阵快速幂完成！`
    });
  } else if (modelId === 'integer-break') {
    // 数学贪心 O(1) 拆分
    steps.push({
      type: 'init',
      line: 1,
      i: 0,
      j: 0,
      tag: '数学极值分析 (均值不等式与数 e 导数)',
      log: `| 📐 证明: 当拆分因子为 e ≈ 2.718 时乘积最大，离散整数最优基底为 3`,
      msg: `数学证明：根据均值不等式与导数极值分析，尽可能拆分为 <strong>3</strong> 可使乘积最大化。`
    });
    let ans = 1;
    if (n === 2) ans = 1;
    else if (n === 3) ans = 2;
    else {
      const mod = n % 3;
      const count3 = Math.floor(n / 3);
      if (mod === 0) ans = Math.pow(3, count3);
      else if (mod === 1) ans = Math.pow(3, count3 - 1) * 4;
      else ans = Math.pow(3, count3) * 2;
    }
    steps.push({
      type: 'return',
      line: 5,
      i: n,
      j: 0,
      tag: `数学 O(1) 答案 = ${ans}`,
      log: `| 🏆 O(1) 闭式解: integerBreak(${n}) = ${ans}`,
      msg: `🏆 数学 O(1) 贪心计算完成！最终乘积: <strong>${ans}</strong>。`
    });
  } else if (modelId === 'unique-bst') {
    // 卡特兰数封闭解
    steps.push({
      type: 'init',
      line: 1,
      i: 0,
      j: 0,
      tag: '卡特兰数 (Catalan Number) 通项公式',
      log: `| 📐 封闭公式: C_n = (1 / (n + 1)) * (2n)! / (n! * n!)`,
      msg: `根据组合数学，n 节点不同 BST 数量严格等于第 n 项<strong>卡特兰数</strong>。`
    });
    let c = 1;
    for (let i = 0; i < n; i++) {
      c = (c * 2 * (2 * i + 1)) / (i + 2);
    }
    steps.push({
      type: 'return',
      line: 5,
      i: n,
      j: 0,
      tag: `卡特兰数 C_${n} = ${c}`,
      log: `| 🏆 卡特兰数计算完成: numTrees(${n}) = ${c}`,
      msg: `🏆 卡特兰数 O(N) 线性推导完成！总形态数: <strong>${c}</strong>。`
    });
  }

  return steps;
}
