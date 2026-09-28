/**
 * Class 053 Code01: 统计全 1 子矩形数量 (Count Submatrices With All Ones / LeetCode 1504)
 *
 * 核心原理：
 * 矩阵逐行压缩为连续 1 高度直方图。单调递增栈在出栈时：
 * 左右两侧比它更矮的最大高度 down = max(leftH, rightH)；
 * 跨度宽度 W = right - left - 1；
 * 阶梯独立贡献 = (H - down) * (W * (W + 1) / 2)。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STACK_053_PROBLEMS } from './stack-053-problem-content';
import {
  COUNT_SUBMATRICES_CODES,
  COUNT_SUBMATRICES_LINES,
} from './stack-053-stage-codes';
import { parseMatrixInput } from '../monotonic-stack-052/maximal-rectangle-052-renderer';

export interface CountSubmatricesStep {
  matrix: number[][];
  curRow: number;
  heights: number[];
  stack: number[];
  curPop: { col: number; H: number; left: number; right: number; down: number; add: number } | null;
  totalSubmatrices: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildCountSubmatrices053Steps(mat: number[][]): CountSubmatricesStep[] {
  const steps: CountSubmatricesStep[] = [];
  const lines = COUNT_SUBMATRICES_LINES;
  const m = mat.length;
  const n = m > 0 ? mat[0].length : 0;

  if (m === 0 || n === 0) {
    steps.push({
      matrix: [],
      curRow: -1,
      heights: [],
      stack: [],
      curPop: null,
      totalSubmatrices: 0,
      decision: '矩阵为空，全 1 子矩形数量为 0。',
      message: '输入规模 0。',
      log: 'empty matrix',
      codeLine: lines.returnAns,
      metrics: { '规模': '0x0', '总子矩形数': 0 },
    });
    return steps;
  }

  const heights = new Array(n).fill(0);
  let totalSubmatrices = 0;

  // Step 0: 入口
  steps.push({
    matrix: mat.map((r) => [...r]),
    curRow: -1,
    heights: [...heights],
    stack: [],
    curPop: null,
    totalSubmatrices: 0,
    decision: `主函数入口：开始统计 ${m} × ${n} 矩阵中全 1 子矩形的总数量。`,
    message: '核心策略：逐行扫描并维护连续 1 高度，利用单调栈阶梯容斥公式逐段结算。',
    log: `enter numSubmat: ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '网格规模': `${m} × ${n}`, '当前总子矩阵': 0, '状态': '初始化' },
  });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      heights[c] = mat[r][c] === 1 ? heights[c] + 1 : 0;
    }

    steps.push({
      matrix: mat.map((row) => [...row]),
      curRow: r,
      heights: [...heights],
      stack: [],
      curPop: null,
      totalSubmatrices,
      decision: `📥 扫描到第 [${r}] 行：更新各列连续 1 高度 heights = [${heights.join(', ')}]。`,
      message: `以行 ${r} 作为底边展开单调栈阶梯累计。`,
      log: `row ${r}: updated heights=[${heights.join(', ')}]`,
      codeLine: lines.updateRow,
      metrics: { '当前底行': `行 ${r}`, '高度柱': `[${heights.join(', ')}]`, '当前总子矩阵': totalSubmatrices },
    });

    const stack: number[] = [];
    for (let j = 0; j < n; j++) {
      while (stack.length > 0 && heights[stack[stack.length - 1]] >= heights[j]) {
        const cur = stack.pop()!;
        if (heights[cur] > heights[j]) {
          const left = stack.length > 0 ? stack[stack.length - 1] : -1;
          const w = j - left - 1;
          const down = Math.max(left >= 0 ? heights[left] : 0, heights[j]);
          const add = (heights[cur] - down) * ((w * (w + 1)) / 2);
          totalSubmatrices += add;

          const popInfo = { col: cur, H: heights[cur], left, right: j, down, add };

          steps.push({
            matrix: mat.map((row) => [...row]),
            curRow: r,
            heights: [...heights],
            stack: [...stack],
            curPop: popInfo,
            totalSubmatrices,
            decision: `🔥 弹出列 [${cur}] (高 H=${heights[cur]})！两侧更矮最高 down=${down}，阶梯净增 = ${add}。`,
            message: `宽度 W=${w}，贡献 = (${heights[cur]} - ${down}) × (${w}×${w + 1}/2) = ${heights[cur] - down} × ${(w * (w + 1)) / 2} = ${add}！累计总数 = ${totalSubmatrices}。`,
            log: `pop col ${cur}: H=${heights[cur]}, down=${down}, add=${add}, total=${totalSubmatrices}`,
            codeLine: lines.popCalc,
            metrics: { '结算列': `[${cur}]`, '阶梯高差': heights[cur] - down, '本次新增': add, '累计总子矩形': totalSubmatrices },
          });
        }
      }
      stack.push(j);
    }

    // 清算当前行栈
    while (stack.length > 0) {
      const cur = stack.pop()!;
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const w = n - left - 1;
      const down = left >= 0 ? heights[left] : 0;
      const add = (heights[cur] - down) * ((w * (w + 1)) / 2);
      totalSubmatrices += add;

      const popInfo = { col: cur, H: heights[cur], left, right: n, down, add };

      steps.push({
        matrix: mat.map((row) => [...row]),
        curRow: r,
        heights: [...heights],
        stack: [...stack],
        curPop: popInfo,
        totalSubmatrices,
        decision: `🧹 清算列 [${cur}] (高 H=${heights[cur]})：向右延伸至边界，阶梯净增 = ${add}。`,
        message: `宽度 W=${w}，贡献 = (${heights[cur]} - ${down}) × ${(w * (w + 1)) / 2} = ${add}！累计总数 = ${totalSubmatrices}。`,
        log: `clear col ${cur}: add=${add}, total=${totalSubmatrices}`,
        codeLine: lines.clearPop,
        metrics: { '清算列': `[${cur}]`, '阶梯高差': heights[cur] - down, '本次新增': add, '累计总子矩形': totalSubmatrices },
      });
    }
  }

  // 终结
  steps.push({
    matrix: mat.map((r) => [...r]),
    curRow: m - 1,
    heights: [...heights],
    stack: [],
    curPop: null,
    totalSubmatrices,
    decision: `🎉 统计完成！矩阵中全部由 1 组成的子矩形总数为 ${totalSubmatrices}。`,
    message: '单调栈阶梯累加精确保证每个子矩形被其最底行、最长阶梯唯一统计，时间复杂度严格 O(M × N)。',
    log: `numSubmat complete: ans=${totalSubmatrices}`,
    codeLine: lines.returnAns,
    metrics: { '全 1 子矩阵总数': totalSubmatrices, '总行数': m, '总列数': n, '复杂度': 'O(M × N)' },
  });

  return steps;
}

export function renderCountSubmatricesCanvas(container: HTMLElement, step: CountSubmatricesStep): void {
  const mat = step.matrix;
  const curRow = step.curRow;
  const heights = step.heights;
  const pop = step.curPop;

  // 上方网格 (使用 table 语义标签)
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

  // 下方高度直方柱
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
