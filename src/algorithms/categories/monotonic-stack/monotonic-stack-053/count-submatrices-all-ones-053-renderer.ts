/**
 * Class 053 Code01: 统计全 1 子矩形数量 (Count Submatrices With All Ones / LeetCode 1504)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STACK_053_PROBLEMS } from './stack-053-problem-content';
import {
  COUNT_SUBMATRICES_CODES,
} from './stack-053-stage-codes';
import { parseMatrixInput } from '../monotonic-stack-052/maximal-rectangle-052-renderer';
import {
  buildCountSubmatrices053Steps,
  type CountSubmatricesStep,
} from './count-submatrices-all-ones-053-step-compiler';

export {
  buildCountSubmatrices053Steps,
  type CountSubmatricesStep,
};

export function renderCountSubmatricesCanvas(container: HTMLElement, step: CountSubmatricesStep): void {
  const mat = step.matrix;
  const curRow = step.curRow;
  const heights = step.heights;
  const pop = step.curPop;

  const matrixHtml = `
    <table style="border-collapse: separate; border-spacing: 4px; margin: 0;">
      <tbody>
        ${mat
          .map((row, r) => {
            const isCur = r === curRow;
            const cells = row
              .map((cell) => {
                let bg = cell === 1 ? (isCur ? '#dbeafe' : '#f8fafc') : '#ffffff';
                let border = cell === 1 ? (isCur ? '#93c5fd' : '#cbd5e1') : '#e2e8f0';
                let color = cell === 1 ? (isCur ? '#1d4ed8' : '#334155') : '#94a3b8';
                return `<td style="width:24px;height:24px;text-align:center;vertical-align:middle;background:${bg};border:1px solid ${border};border-radius:4px;font-size:11px;font-weight:800;color:${color};font-family:monospace;padding:0;">${cell}</td>`;
              })
              .join('');
            return `
              <tr style="background:${isCur ? '#eff6ff' : 'transparent'};border-radius:4px;">
                <td style="font-size:9.5px;color:#64748b;font-family:monospace;padding-right:6px;white-space:nowrap;">[R${r}]</td>
                ${cells}
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;

  const maxH = Math.max(...heights, 5);
  const barsHtml = heights
    .map((h, c) => {
      const isPop = pop && pop.col === c;
      const hPercent = Math.max(8, Math.min(100, Math.round((h / maxH) * 85)));
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:28px;">
          <span style="font-size:10px;font-weight:800;color:${isPop ? '#10b981' : '#64748b'};font-family:monospace;">${h}</span>
          <div style="width:100%;height:85px;display:flex;align-items:flex-end;justify-content:center;">
            <div style="width:20px;height:${hPercent}%;background:${isPop ? '#10b981' : '#cbd5e1'};border-radius:3px 3px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8.5px;font-weight:800;">${h > 0 ? h : ''}</div>
          </div>
          <span style="font-size:8.5px;color:#94a3b8;">[${c}]</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width:100%;display:flex;flex-direction:column;gap:12px;padding:12px;box-sizing:border-box;">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:800;color:#475569;">🧱 矩阵逐行压缩与阶梯容斥累计</span>
          <span style="font-size:11px;font-family:monospace;background:#ecfdf5;color:#047857;padding:2px 10px;border-radius:8px;font-weight:800;">全 1 子矩阵累计: ${step.totalSubmatrices}</span>
        </div>
        <div style="overflow-x:auto;">${matrixHtml}</div>
      </div>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <span style="font-size:10.5px;font-weight:700;color:#475569;">📊 底行连续 1 柱体与阶梯结算</span>
        <div style="display:flex;justify-content:space-around;align-items:flex-end;padding:8px 0;border-bottom:1.5px solid #e2e8f0;">
          ${barsHtml}
        </div>
        ${pop ? `<div style="margin-top:8px;font-size:10.5px;font-family:monospace;color:#047857;background:#ecfdf5;padding:4px 10px;border-radius:6px;">🎯 阶梯公式: (H:${pop.H} - down:${pop.down}) × (宽${pop.right - pop.left - 1}组合 ${(pop.right - pop.left - 1) * (pop.right - pop.left) / 2}) = <strong>+${pop.add}</strong> 个子矩形</div>` : ''}
      </div>
    </div>
  `;
}

const DEFAULT_MAT = [
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 0],
];

export const countSubmatrices053Visualizer = registerDeclarativeAlgorithm<CountSubmatricesStep>({
  id: 'count-submatrices-all-ones-053',
  name: '统计全 1 子矩形数量 (Class 053 Code01)',
  category: 'monotonic-stack',
  aliases: ['count-submatrices-all-ones-053', 'class053-code01'],
  difficulty: 'hard',
  learningGoal: '掌握二维矩阵行压缩与单调栈阶梯容斥计数公式，理解底边对齐且高差区间的无重复累计精髓。',
  problemContent: STACK_053_PROBLEMS.countSubmatrices053,
  codeLanguages: COUNT_SUBMATRICES_CODES,
  inputs: [
    {
      id: 'matrix',
      label: '二维 0/1 矩阵',
      type: 'text',
      defaultValue: '1,0,1; 1,1,0; 1,1,0',
      placeholder: '分号或换行分隔各行，逗号分隔 0 和 1',
    },
  ],
  presets: [
    { label: '示例 1: 官方 3×3 矩阵 (13个)', values: { matrix: '1,0,1; 1,1,0; 1,1,0' } },
    { label: '示例 2: 全 1 矩阵 2×3 (18个)', values: { matrix: '1,1,1; 1,1,1' } },
    { label: '示例 3: 对角线矩阵 3×3 (3个)', values: { matrix: '1,0,0; 0,1,0; 0,0,1' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseMatrixInput(inputs.matrix, DEFAULT_MAT);
    return buildCountSubmatrices053Steps(raw);
  },
  renderCanvas: (container, step) => renderCountSubmatricesCanvas(container, step),
});
