/**
 * 二维差分与二维前缀和 (2D Difference Array & Prefix Sum) - 声明式教学级沙盘渲染器
 * 核心原理：二维四个角点增减平衡，前缀和容斥还原子矩阵修改
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_DIFF_PROBLEMS } from './array-diff-problem-content';
import { DIFF_2D_CODES } from './array-diff-stage-codes';
import {
  Diff2DStep,
  buildDiff2DSteps,
} from './diff-array-2d-step-compiler';

// 向后兼容导出
export type { Diff2DStep };
export { buildDiff2DSteps };

export const diffArray2DVisualizer = registerDeclarativeAlgorithm<Diff2DStep>({
  id: 'diff-array-2d-048',
  name: '二维差分与二维前缀和 (2D Difference Array)',
  category: 'array',
  icon: '🗺️',
  difficulty: 3,
  levelOrder: 481,
  aliases: ['class048-code01', 'diff-array-2d', 'stamping-grid-2132', 'leetcode-2132', 'luogu-p3397'],
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
