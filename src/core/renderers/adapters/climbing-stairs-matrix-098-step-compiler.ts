/**
 * 爬楼梯矩阵快速幂 (Climbing Stairs Matrix Power) StepCompiler
 * 核心原理：dp[n] = dp[n-1] + dp[n-2]，同构于斐波那契矩阵，ans = 2 * res[0][0] + res[1][0]
 */

import { CLIMBING_STAIRS_LINES } from '../../../algorithms/categories/math/math-098/math-098-stage-codes';
import { Math098Step, matrixPower } from '../../../algorithms/categories/math/math-098/math-098-shared';

export interface ClimbingStairsStep extends Math098Step {
  n: number;
}

export function buildClimbingStairsSteps(n: number): ClimbingStairsStep[] {
  const steps: ClimbingStairsStep[] = [];
  const lines = CLIMBING_STAIRS_LINES;

  const baseMatrix = [
    [1, 1],
    [1, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：求解 n=${n} 阶台阶的不同爬法数 (每次 1 或 2 阶)`,
    message: '递推方程 dp[n] = dp[n-1] + dp[n-2]，采用矩阵快速幂加速至 O(log n)',
    log: `enter climbStairs(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '台阶数 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: 边界特判
  if (n <= 2) {
    steps.push({
      n,
      decision: `边界特判：n=${n} <= 2，1 阶有 1 种方法，2 阶有 2 种方法，直接返回 ${n}`,
      message: '基础楼梯台阶数',
      log: `n <= 2, return ${n}`,
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '最终结果': `${n}` },
      finalValue: n,
    });
    return steps;
  }

  // Step 2: 矩阵初始化
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    decision: '构建 2×2 状态转移矩阵 base = [[1, 1], [1, 0]]',
    message: '转移关系 [dp(n), dp(n-1)] = [dp(2), dp(1)] × base^(n-2)',
    log: 'init base matrix',
    line: lines.initMatrix.javascript,
    codeLine: lines.initMatrix,
    metrics: { '矩阵结构': '2×2' },
  });

  // Step 3: 快速幂
  const p = n - 2;
  const res = matrixPower(baseMatrix, p);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `计算矩阵幂次：base^(${p}) % 1000000007 完成！`,
    message: '对数时间矩阵连乘完成',
    log: `computed matrixPower(base, ${p})`,
    line: lines.powerCompute.javascript,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${p}`, 'res[0][0]': `${res[0][0]}`, 'res[1][0]': `${res[1][0]}` },
  });

  // Step 4: 返回
  const ans = (2 * res[0][0] + res[1][0]) % 1000000007;
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！爬 ${n} 阶台阶共有 2 * res[0][0] + res[1][0] = 2 × ${res[0][0]} + ${res[1][0]} = ${ans} 种方法！`,
    message: '收敛返回',
    log: `return ${ans}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`dp[${n}]`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}
