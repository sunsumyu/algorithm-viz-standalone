/**
 * 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：dp[n] = 2 * dp[n-1] + dp[n-3]，构造 3×3 矩阵加速至 O(log n)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { DOMINO_TROMINO_CODES, DOMINO_TROMINO_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

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
    codeLine: lines.returnAns,
    metrics: { [`dp[${n}]`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const dominoTrominoMatrixVisualizer = registerDeclarativeAlgorithm<DominoStep>({
  id: 'domino-tromino-matrix-098',
  name: '多米诺与托米诺平铺矩阵快速幂',
  category: 'math',
  icon: '🀄',
  difficulty: 3,
  levelOrder: 985,
  learningGoal: '通过几何骨牌覆盖推导出线性递推式，并转化为 3×3 矩阵快速幂加速',
  problemHtml: MATH_098_PROBLEMS.dominoTromino.html,
  analysisHtml: MATH_098_PROBLEMS.dominoTromino.html,
  inputs: [
    {
      id: 'input-n',
      label: '面板长度 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: DOMINO_TROMINO_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildDominoSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: DominoStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, '3×3 转移基底矩阵');
    if (step.curAnsMatrix) renderMatrix(matricesRow, step.curAnsMatrix, `幂次结果矩阵 (base^${Math.max(0, step.n - 3)})`);
    root.appendChild(matricesRow);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
