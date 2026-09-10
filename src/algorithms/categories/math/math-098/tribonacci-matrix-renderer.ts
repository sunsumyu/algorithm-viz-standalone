/**
 * 泰波那契数矩阵快速幂 (Tribonacci Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：3阶齐次线性递推，3×3 矩阵转移求解 T(n) = T(n-1) + T(n-2) + T(n-3)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { TRIBONACCI_MATRIX_CODES, TRIBONACCI_MATRIX_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

export interface TribonacciStep extends Math098Step {
  n: number;
}

export function buildTribonacciSteps(n: number): TribonacciStep[] {
  const steps: TribonacciStep[] = [];
  const lines = TRIBONACCI_MATRIX_LINES;

  const baseMatrix = [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：计算第 n=${n} 项泰波那契数 T(${n})`,
    message: '递推式 T(n) = T(n-1) + T(n-2) + T(n-3)，基底 T(0)=0, T(1)=1, T(2)=1',
    log: `enter tribonacci(n=${n})`,
    codeLine: lines.entry,
    metrics: { '目标项 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: 边界特判
  if (n === 0) {
    steps.push({
      n,
      decision: '边界特判：n=0，返回 T(0) = 0',
      message: '基础初值',
      log: 'n == 0, return 0',
      codeLine: lines.guard,
      metrics: { '最终结果': '0' },
      finalValue: 0,
    });
    return steps;
  }
  if (n <= 2) {
    steps.push({
      n,
      decision: `边界特判：n=${n} <= 2，返回 T(${n}) = 1`,
      message: '基础初值',
      log: `n <= 2, return 1`,
      codeLine: lines.guard,
      metrics: { '最终结果': '1' },
      finalValue: 1,
    });
    return steps;
  }

  // Step 2: 矩阵初始化
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    decision: '构建 3×3 线性递推状态转移矩阵 base',
    message: '[T(n), T(n-1), T(n-2)] = [T(2), T(1), T(0)] × base^(n-2)',
    log: 'init 3x3 base matrix',
    codeLine: lines.initMatrix,
    metrics: { '矩阵阶数': '3×3' },
  });

  // Step 3: 快速幂
  const p = n - 2;
  const res = matrixPower(baseMatrix, p);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `执行 3×3 矩阵快速幂：base^(${p}) 完成！`,
    message: '快速幂将 O(n) 降低为 O(3^3 * log n) = O(log n)',
    log: `computed matrixPower(base, ${p})`,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${p}` },
  });

  // Step 4: 返回
  const ans = (res[0][0] + res[1][0]) % 1000000007;
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！T(${n}) = res[0][0] + res[1][0] = ${res[0][0]} + ${res[1][0]} = ${ans}`,
    message: '收敛返回',
    log: `return ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`T(${n})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const tribonacciMatrixVisualizer = registerDeclarativeAlgorithm<TribonacciStep>({
  id: 'tribonacci-matrix-power-098',
  name: '泰波那契矩阵快速幂 (Tribonacci Matrix)',
  category: 'math',
  icon: '🔺',
  difficulty: 3,
  levelOrder: 984,
  learningGoal: '掌握 3 阶常系数线性递推向 3×3 状态转移矩阵的拓展构建与快速计算',
  problemHtml: MATH_098_PROBLEMS.tribonacciMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.tribonacciMatrix.html,
  inputs: [
    {
      id: 'input-n',
      label: '目标项数 n',
      type: 'number',
      defaultValue: 12,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 12',
    },
  ],
  codeLanguages: TRIBONACCI_MATRIX_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '12'), 10) || 12);
    return buildTribonacciSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: TribonacciStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, '3×3 转移基底矩阵');
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
