/**
 * Class 133: 高斯消元法 (Gaussian Elimination)
 * 洛谷 P3389 【模板】高斯消元法 / P2455 线性方程组
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { GAUSSIAN_ELIMINATION_CODES, GAUSSIAN_ELIMINATION_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep, renderGaussianMatrix } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface GaussianStep extends AdvancedStep {
  matrix: number[][];
  n: number;
  curCol: number;
  activeRow: number;
  solution?: number[];
}

export function buildGaussianSteps(rawMatrix: number[][], n: number): GaussianStep[] {
  const steps: GaussianStep[] = [];
  const lines = GAUSSIAN_ELIMINATION_LINES;

  // 深度复制矩阵
  const a: number[][] = rawMatrix.map(row => [...row]);

  const getSnapshot = (): number[][] => a.map(r => [...r]);

  // Step 0: 入口
  steps.push({
    matrix: getSnapshot(),
    n,
    curCol: -1,
    activeRow: -1,
    decision: `主函数入口：开始对 ${n} 元一次方程组的增广矩阵 [A | B] 执行高斯消元`,
    message: '通过初等行变换将增广矩阵消元为上三角矩阵，再自底向上回代求解未知数向量 x',
    log: `enter gaussianElimination(n=${n})`,
    codeLine: lines.entry,
    metrics: { '未知数个数 N': n, '方程总数': n, '增广矩阵大小': `${n} x ${n + 1}` },
  });

  // 前向消元
  for (let col = 0; col < n; col++) {
    // 1. 选主元
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) {
        pivot = r;
      }
    }

    steps.push({
      matrix: getSnapshot(),
      n,
      curCol: col,
      activeRow: pivot,
      decision: `第 ${col} 列选主元：在当前列自 r${col} 至 r${n - 1} 中选出绝对值最大行 r${pivot} (值 ${a[pivot][col].toFixed(2)})`,
      message: '最大主元法可有效减小浮点舍入误差，增强数值计算稳定性',
      log: `selectPivot: col=${col}, pivotRow=${pivot}`,
      codeLine: lines.selectPivot,
      metrics: { '当前列': col, '主元行': pivot, '主元值': a[pivot][col].toFixed(2) },
    });

    // 2. 交换行
    if (pivot !== col) {
      const tmp = a[col];
      a[col] = a[pivot];
      a[pivot] = tmp;

      steps.push({
        matrix: getSnapshot(),
        n,
        curCol: col,
        activeRow: col,
        decision: `🔄 行交换：将主元行 r${pivot} 与当前对角线行 r${col} 互相交换`,
        message: `使主元对准对角线位置 a[${col}][${col}]`,
        log: `swapRow: r${col} <-> r${pivot}`,
        codeLine: lines.swapRow,
        metrics: { '交换行对': `r${col} 与 r${pivot}` },
      });
    }

    // 3. 消元下方所有行
    for (let r = col + 1; r < n; r++) {
      const factor = a[r][col] / a[col][col];
      for (let c = col; c <= n; c++) {
        a[r][c] -= factor * a[col][c];
      }

      steps.push({
        matrix: getSnapshot(),
        n,
        curCol: col,
        activeRow: r,
        decision: `行消元：利用当前行 r${col} 消除 r${r} 在第 ${col} 列的系数 (乘数 factor = ${factor.toFixed(2)})`,
        message: `消元变换后 r${r} 的第 ${col} 列系数成功清零`,
        log: `eliminate: r${r} -= ${factor.toFixed(2)} * r${col}`,
        codeLine: lines.eliminate,
        metrics: { '消元目标行': `r${r}`, '消元倍率': factor.toFixed(2) },
      });
    }
  }

  // 回代求解
  const x: number[] = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = a[r][n];
    for (let c = r + 1; c < n; c++) {
      s -= a[r][c] * x[c];
    }
    x[r] = s / a[r][r];

    steps.push({
      matrix: getSnapshot(),
      n,
      curCol: -1,
      activeRow: r,
      solution: [...x],
      decision: `回代求解未知数 x${r}：常数 ${a[r][n].toFixed(2)} 减去已知项得 ${s.toFixed(2)}，除以主元系数 ${a[r][r].toFixed(2)} 得到 x${r} = ${x[r].toFixed(2)}`,
      message: `自底向上已求出未知数: x${r} = ${x[r].toFixed(2)}`,
      log: `backSub: x[${r}] = ${x[r].toFixed(2)}`,
      codeLine: lines.backSub,
      metrics: { '求解未知数': `x${r}`, '计算值': x[r].toFixed(2) },
      statusBadge: { text: `求出 x${r} = ${x[r].toFixed(2)}`, type: 'info' },
    });
  }

  // 终态
  steps.push({
    matrix: getSnapshot(),
    n,
    curCol: -1,
    activeRow: -1,
    solution: [...x],
    decision: `✅ 高斯消元求解完毕！方程组的唯一确定解向量为: [${x.map((v, i) => `x${i} = ${v.toFixed(2)}`).join(', ')}]`,
    message: `整个消元过程初等行变换耗时 O(N^3)，回代耗时 O(N^2)，数值稳定精确！`,
    log: `gaussian elimination finished, solution: [${x.map(v => v.toFixed(2)).join(', ')}]`,
    codeLine: lines.returnAns,
    metrics: { '方程组状态': '唯一解', '时间复杂度': 'O(N^3)', '解向量': x.map(v => v.toFixed(2)).join(', ') },
    statusBadge: { text: '方程组求解成功', type: 'success' },
  });

  return steps;
}

export const gaussianEliminationVisualizer = registerDeclarativeAlgorithm<GaussianStep>({
  id: 'gaussian-elimination-133',
  name: '高斯消元法 (Class 133)',
  category: 'math',
  icon: '🔢',
  difficulty: 3,
  levelOrder: 133,
  learningGoal: '深刻理解高斯消元最大主元选取、初等行变换化上三角与自底向上回代求解线性方程组机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.gaussianElimination.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.gaussianElimination.html,
  inputs: [
    {
      id: 'matrixPreset',
      label: '增广矩阵预设',
      type: 'select',
      defaultValue: 'standard_3x3',
      options: [
        { label: '标准 3x3 方程组 (x0=1, x1=2, x2=3)', value: 'standard_3x3' },
        { label: '交错系数 3x3 方程组', value: 'staggered_3x3' },
      ],
    },
  ],
  codeLanguages: GAUSSIAN_ELIMINATION_CODES,
  generateSteps: (input) => {
    const preset = String(input.matrixPreset || 'standard_3x3');
    if (preset === 'staggered_3x3') {
      const mat = [
        [2, 1, -1, 8],
        [-3, -1, 2, -11],
        [-2, 1, 2, -3],
      ];
      return buildGaussianSteps(mat, 3);
    }
    // standard 3x3:
    // 1*x0 + 1*x1 + 1*x2 = 6
    // 2*x0 + 3*x1 + 1*x2 = 11
    // 1*x0 - 1*x1 + 2*x2 = 5
    // 唯一确定解: x0=1, x1=2, x2=3
    const stdMat = [
      [1, 1, 1, 6],
      [2, 3, 1, 11],
      [1, -1, 2, 5],
    ];
    return buildGaussianSteps(stdMat, 3);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderGaussianMatrix(step.matrix, step.n, step.curCol, step.activeRow, step.solution)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前主元处理列</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.curCol >= 0 ? `第 ${step.curCol} 列` : '回代阶段'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作活跃行</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.activeRow >= 0 ? `r${step.activeRow}` : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前解向量 x</div>
            <div style="font-size: 14px; font-weight: 700; color: #d97706;">
              ${step.solution ? step.solution.map((v, i) => `x${i}=${v.toFixed(2)}`).join(', ') : '消元中'}
            </div>
          </div>
        </div>

        ${renderFormulaCard(
          '高斯消元算法推进',
          `当前状态: ${step.curCol >= 0 ? `消元列 ${step.curCol}` : '回代完成'} | 矩阵规模: ${step.n} x ${step.n + 1}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
