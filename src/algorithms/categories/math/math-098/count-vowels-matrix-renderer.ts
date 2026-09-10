/**
 * 元音排列矩阵快速幂 (Count Vowels Permutation) - 声明式教学级沙盘渲染器
 * 核心原理：5元有限状态机，5×5 状态转移矩阵快速幂
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { COUNT_VOWELS_CODES, COUNT_VOWELS_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

export interface CountVowelsStep extends Math098Step {
  n: number;
}

export function buildCountVowelsSteps(n: number): CountVowelsStep[] {
  const steps: CountVowelsStep[] = [];
  const lines = COUNT_VOWELS_LINES;

  const baseMatrix = [
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 1, 1],
    [0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：计算长度为 n=${n} 的合法元音排列字符串数量`,
    message: '元音 a, e, i, o, u 遵循转移规则，建模为 5×5 状态机矩阵',
    log: `enter countVowelPermutation(n=${n})`,
    codeLine: lines.entry,
    metrics: { '字符串长度 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: n = 1
  if (n === 1) {
    steps.push({
      n,
      decision: '边界特判：n=1 时，单个元音 [a, e, i, o, u] 均合法，直接返回 5',
      message: '基础初值',
      log: 'n == 1, return 5',
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
    decision: '构建 5×5 元音状态转移矩阵 base (对应 a, e, i, o, u 互相转移规则)',
    message: '状态向量 [c(a), c(e), c(i), c(o), c(u)]',
    log: 'init 5x5 vowel matrix',
    codeLine: lines.initMatrix,
    metrics: { '矩阵阶数': '5×5' },
  });

  // Step 3: 快速幂
  const p = n - 1;
  const res = matrixPower(baseMatrix, p);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `执行 5×5 矩阵快速幂：base^(${p}) 完成！`,
    message: '在 O(5^3 * log n) = O(log n) 时间内完成计算',
    log: `computed matrixPower(base, ${p})`,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${p}` },
  });

  // Step 4: 全矩阵求和返回
  let sum = 0n;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      sum = (sum + BigInt(res[i][j])) % 1000000007n;
    }
  }
  const ans = Number(sum);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！长度为 ${n} 的合法元音排列共有 ${ans} 个！`,
    message: '收敛返回',
    log: `return ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`Permutations(${n})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const countVowelsMatrixVisualizer = registerDeclarativeAlgorithm<CountVowelsStep>({
  id: 'count-vowels-matrix-098',
  name: '元音排列矩阵快速幂 (Count Vowels Matrix)',
  category: 'math',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 986,
  learningGoal: '掌握字符相邻约束图向有向图邻接转移矩阵的转化与全状态求和',
  problemHtml: MATH_098_PROBLEMS.countVowels.html,
  analysisHtml: MATH_098_PROBLEMS.countVowels.html,
  inputs: [
    {
      id: 'input-n',
      label: '字符串长度 n',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: COUNT_VOWELS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5);
    return buildCountVowelsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CountVowelsStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, '5×5 元音转移基底');
    if (step.curAnsMatrix) renderMatrix(matricesRow, step.curAnsMatrix, `幂次矩阵 (base^${Math.max(0, step.n - 1)})`);
    root.appendChild(matricesRow);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
