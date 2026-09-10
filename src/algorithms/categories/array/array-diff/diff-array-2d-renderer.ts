/**
 * 二维差分与二维前缀和 (2D Difference Array & Prefix Sum) - 声明式教学级沙盘渲染器
 * 核心原理：二维四个角点增减平衡，前缀和容斥还原子矩阵修改
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_DIFF_PROBLEMS } from './array-diff-problem-content';
import { DIFF_2D_CODES, DIFF_2D_LINES } from './array-diff-stage-codes';
import { ArrayDiffStep } from './array-diff-shared';

export interface Diff2DStep extends ArrayDiffStep {
  n: number;
  m: number;
  ops: number[][];
}

export function buildDiff2DSteps(ops: number[][], n: number, m: number): Diff2DStep[] {
  const steps: Diff2DStep[] = [];
  const lines = DIFF_2D_LINES;

  const diff = Array.from({ length: n + 2 }, () => new Array(m + 2).fill(0));

  // Step 0: 入口
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: [],
    decision: `主函数入口：处理 ${ops.length} 组二维子矩阵增量操作，网格规模 ${n}×${m}`,
    message: '利用二维容斥原理，每次子矩阵增量修改仅需在 4 个关键角点执行 O(1) 增减',
    log: `enter solve(ops, n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '行数 n': `${n}`, '列数 m': `${m}`, '操作数': `${ops.length}` },
  });

  // Step 1: 内存分配
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: [],
    decision: `分配二维差分矩阵：int[][] diff = new int[${n + 2}][${m + 2}]`,
    message: '外围保留边界哨兵避免越界',
    log: 'init 2D diff matrix',
    codeLine: lines.initDiff,
    metrics: { '矩阵尺寸': `${n + 2}×${m + 2}` },
  });

  // Step 2: 遍历操作修改四个角点
  for (const op of ops) {
    const [x1, y1, x2, y2, val] = op;
    diff[x1][y1] += val;
    diff[x2 + 1][y1] -= val;
    diff[x1][y2 + 1] -= val;
    diff[x2 + 1][y2 + 1] += val;

    steps.push({
      n,
      m,
      ops,
      diffMatrix: diff.map(r => [...r]),
      ansMatrix: [],
      decision: `标记子矩阵 (${x1}, ${y1}) ~ (${x2}, ${y2}) 加 ${val}：
diff[${x1}][${y1}] += ${val}, diff[${x2 + 1}][${y1}] -= ${val}, diff[${x1}][${y2 + 1}] -= ${val}, diff[${x2 + 1}][${y2 + 1}] += ${val}`,
      message: '四角点增减抵消完成',
      log: `op [${x1},${y1}] to [${x2},${y2}] val=${val}`,
      codeLine: lines.updateCorners,
      metrics: { '修改区域': `(${x1},${y1})~(${x2},${y2})`, '增量': `+${val}` },
    });
  }

  // Step 3: 二维前缀和还原
  const ans = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: `开始二维前缀和扫描还原：int[][] ans = new int[${n + 1}][${m + 1}]`,
    message: '递推式 ans[i][j] = ans[i-1][j] + ans[i][j-1] - ans[i-1][j-1] + diff[i][j]',
    log: 'start 2D prefix sum scan',
    codeLine: lines.initAns,
    metrics: { '还原进度': '准备扫描' },
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      ans[i][j] = ans[i - 1][j] + ans[i][j - 1] - ans[i - 1][j - 1] + diff[i][j];
    }
  }

  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: '二维前缀和容斥扫描完成！全矩阵真实值成功恢复',
    message: '每一个格子均为左方、上方和左上方的容斥叠加',
    log: '2D prefix sum scan finished',
    codeLine: lines.prefix2D,
    metrics: { '还原状态': '已完成' },
  });

  // Step 4: 返回
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: `🎉 二维差分计算完成！最终还原的 ${n}×${m} 网格已完全收敛`,
    message: '算法成功收敛',
    log: 'done 2D diff',
    codeLine: lines.returnAns,
    metrics: { '最终结果': `${n}×${m} 矩阵已还原` },
  });

  return steps;
}

export const diffArray2DVisualizer = registerDeclarativeAlgorithm<Diff2DStep>({
  id: 'diff-array-2d-048',
  name: '二维差分与二维前缀和 (2D Difference Array)',
  category: 'array',
  icon: '🗺️',
  difficulty: 3,
  levelOrder: 481,
  learningGoal: '理解二维四角点容斥抵消机制，掌握高维差分向高维前缀和的闭环转化',
  problemHtml: ARRAY_DIFF_PROBLEMS.diff2D.html,
  analysisHtml: ARRAY_DIFF_PROBLEMS.diff2D.html,
  inputs: [
    {
      id: 'input-ops',
      label: '子矩阵操作 (x1, y1, x2, y2, val; 分号隔开)',
      type: 'text',
      defaultValue: '1, 1, 2, 2, 5; 2, 2, 3, 3, 3',
      placeholder: '例如 1, 1, 2, 2, 5; 2, 2, 3, 3, 3',
    },
    {
      id: 'input-n',
      label: '行数 n',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-m',
      label: '列数 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: DIFF_2D_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-ops'] ?? '1, 1, 2, 2, 5; 2, 2, 3, 3, 3');
    const ops = raw.split(';').map(item =>
      item.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    ).filter(b => b.length === 5);
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '3'), 10) || 3);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildDiff2DSteps(ops.length > 0 ? ops : [[1, 1, 2, 2, 5], [2, 2, 3, 3, 3]], n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: Diff2DStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 结果矩阵展示
    if (step.ansMatrix && step.ansMatrix.length > 0) {
      const card = document.createElement('div');
      card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

      let rowsHtml = '';
      for (let i = 1; i <= step.n; i++) {
        let cells = '';
        for (let j = 1; j <= step.m; j++) {
          cells += `
            <td style="padding: 6px 12px; text-align: center; background: #eff6ff; border: 1px solid #93c5fd; font-family: monospace; font-size: 13px; font-weight: 800; color: #1d4ed8;">
              ${step.ansMatrix[i]?.[j] ?? 0}
            </td>
          `;
        }
        rowsHtml += `<tr>${cells}</tr>`;
      }

      card.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
          🗺️ 二维前缀和还原矩阵 ans (1..${step.n} × 1..${step.m}):
        </div>
        <table style="border-collapse: collapse; margin: 0 auto;">${rowsHtml}</table>
      `;
      root.appendChild(card);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
