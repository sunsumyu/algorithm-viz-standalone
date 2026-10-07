/**
 * 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino Matrix Power) Step Compiler
 * 核心原理：dp[n] = 2 * dp[n-1] + dp[n-3]，构造 3×3 矩阵加速至 O(log n)
 */

import { DOMINO_TROMINO_LINES } from '../../../algorithms/categories/math/math-098/math-098-stage-codes';
import { Math098Step, matrixPower } from '../../../algorithms/categories/math/math-098/math-098-shared';

export interface DominoStep extends Math098Step {
  n: number;
}

export function buildDominoSteps(n: number): DominoStep[] {
  const steps: DominoStep[] = [];
  const lines = DOMINO_TROMINO_LINES;

  const baseMatrix = [
    [2, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：计算 2×${n} 面板的多米诺与托米诺平铺方案数`,
    message: '递推方程 dp[n] = 2*dp[n-1] + dp[n-3]，基底 dp[1]=1, dp[2]=2, dp[3]=5',
    log: `enter numTilings(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '面板长度 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: 边界特判
  if (n <= 2) {
    steps.push({
      n,
      decision: `边界特判：n=${n} <= 2，返回 ${n}`,
      message: '基础面板初值',
      log: `n <= 2, return ${n}`,
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '最终结果': `${n}` },
      finalValue: n,
    });
    return steps;
  }
  if (n === 3) {
    steps.push({
      n,
      decision: '边界特判：n=3，返回 dp[3] = 5',
      message: '基础面板初值',
      log: 'n == 3, return 5',
      line: lines.guard.javascript,
      codeLine: lines.guard,
      metrics: { '最终结果': '5' },
      finalValue: 5,
    });
    return steps;
  }

  // Step 2: 矩阵初始化
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    decision: '构建 3×3 线性递推状态转移矩阵 base = [[2,1,0], [0,0,1], [1,0,0]]',
    message: '[dp(n), dp(n-1), dp(n-2)] = [dp(3), dp(2), dp(1)] × base^(n-3)',
    log: 'init 3x3 base matrix',
    line: lines.initMatrix.javascript,
    codeLine: lines.initMatrix,
    metrics: { '矩阵结构': '3×3' },
  });

  // Step 3: 快速幂
  const p = n - 3;
  const res = matrixPower(baseMatrix, p);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `计算 3×3 矩阵快速幂：base^(${p}) 完成！`,
    message: '在对数时间内完成矩阵相乘',
    log: `computed matrixPower(base, ${p})`,
    line: lines.powerCompute.javascript,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${p}` },
  });

  // Step 4: 返回
  const ans = Number(
    (5n * BigInt(res[0][0]) + 2n * BigInt(res[1][0]) + 1n * BigInt(res[2][0])) % 1000000007n
  );
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！平铺 2×${n} 面板的方案数为 (5*res[0][0] + 2*res[1][0] + res[2][0]) % 10^9+7 = ${ans}`,
    message: '收敛返回',
    log: `return ${ans}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`dp[${n}]`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}
