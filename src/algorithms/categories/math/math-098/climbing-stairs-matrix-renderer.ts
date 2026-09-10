/**
 * 爬楼梯矩阵快速幂 (Climbing Stairs Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：dp[n] = dp[n-1] + dp[n-2]，同构于斐波那契矩阵，ans = 2 * res[0][0] + res[1][0]
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { CLIMBING_STAIRS_CODES, CLIMBING_STAIRS_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

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
    message: `对数时间矩阵连乘完成`,
    log: `computed matrixPower(base, ${p})`,
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
    codeLine: lines.returnAns,
    metrics: { [`dp[${n}]`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const climbingStairsMatrixVisualizer = registerDeclarativeAlgorithm<ClimbingStairsStep>({
  id: 'climbing-stairs-matrix-098',
  name: '爬楼梯矩阵快速幂 (Climbing Stairs Matrix)',
  category: 'math',
  icon: '🪜',
  difficulty: 2,
  levelOrder: 983,
  learningGoal: '掌握斐波那契同构问题在矩阵快速幂中的初值代入 [dp(2)=2, dp(1)=1]',
  problemHtml: MATH_098_PROBLEMS.climbingStairsMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.climbingStairsMatrix.html,
  inputs: [
    {
      id: 'input-n',
      label: '台阶数 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: CLIMBING_STAIRS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildClimbingStairsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: ClimbingStairsStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, '状态转移基底矩阵 base');
    if (step.curAnsMatrix) renderMatrix(matricesRow, step.curAnsMatrix, `幂次结果矩阵 (base^${Math.max(0, step.n - 2)})`);
    root.appendChild(matricesRow);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
