/**
 * 斐波那契数矩阵快速幂 (Fibonacci Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：[F(n), F(n-1)] = [F(2), F(1)] * [[1,1],[1,0]]^(n-2)，O(log n) 求解
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { FIBONACCI_MATRIX_CODES, FIBONACCI_MATRIX_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

export interface FibMatrixStep extends Math098Step {
  n: number;
}

export function buildFibMatrixSteps(n: number): FibMatrixStep[] {
  const steps: FibMatrixStep[] = [];
  const lines = FIBONACCI_MATRIX_LINES;

  const baseMatrix = [
    [1, 1],
    [1, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：准备计算第 n=${n} 项斐波那契数`,
    message: '构造状态转移矩阵 [[1, 1], [1, 0]]，利用矩阵快速幂在 O(log n) 内求解',
    log: `enter fib(n=${n})`,
    codeLine: lines.entry,
    metrics: { '目标项 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: 边界特判
  if (n <= 0) {
    steps.push({
      n,
      decision: `边界特判：n=${n} <= 0，返回 0`,
      message: 'F(0) = 0',
      log: 'n <= 0, return 0',
      codeLine: lines.guard,
      metrics: { '最终结果': '0' },
      finalValue: 0,
    });
    return steps;
  }
  if (n <= 2) {
    steps.push({
      n,
      decision: `边界特判：n=${n} <= 2，F(1)=1, F(2)=1，直接返回 1`,
      message: '基础斐波那契项',
      log: 'n <= 2, return 1',
      codeLine: lines.guard,
      metrics: { '最终结果': '1' },
      finalValue: 1,
    });
    return steps;
  }

  // Step 2: 构造初始转移矩阵
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    decision: '构建 2×2 线性递推状态转移矩阵 base = [[1, 1], [1, 0]]',
    message: '转移方程 [F(n), F(n-1)] = [F(n-1), F(n-2)] × [[1,1],[1,0]]',
    log: 'init base matrix',
    codeLine: lines.initMatrix,
    metrics: { '矩阵阶数': '2×2' },
  });

  // Step 3: 矩阵快速幂计算
  const p = n - 2;
  const res = matrixPower(baseMatrix, p);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `执行矩阵快速幂：base^(${p}) % 1000000007 运算完成！`,
    message: `在 O(log ${p}) 步内完成矩阵相乘，得到幂次矩阵`,
    log: `computed matrix power base^${p}`,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${p}`, 'res[0][0]': `${res[0][0]}`, 'res[1][0]': `${res[1][0]}` },
  });

  // Step 4: 结果收敛
  const ans = (res[0][0] + res[1][0]) % 1000000007;
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！F(${n}) = res[0][0] + res[1][0] = ${res[0][0]} + ${res[1][0]} = ${ans}`,
    message: '算法在对数时间内高效输出结果',
    log: `return F(${n}) = ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`F(${n})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const fibonacciMatrixVisualizer = registerDeclarativeAlgorithm<FibMatrixStep>({
  id: 'fibonacci-matrix-power-098',
  name: '斐波那契矩阵快速幂 (Fibonacci Matrix)',
  category: 'math',
  icon: '🌀',
  difficulty: 3,
  levelOrder: 982,
  learningGoal: '掌握常系数线性齐次递推数列转化为状态转移矩阵快速幂的标准范式',
  problemHtml: MATH_098_PROBLEMS.fibonacciMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.fibonacciMatrix.html,
  inputs: [
    {
      id: 'input-n',
      label: '目标项数 n',
      type: 'number',
      defaultValue: 10,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: FIBONACCI_MATRIX_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildFibMatrixSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: FibMatrixStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示区
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
