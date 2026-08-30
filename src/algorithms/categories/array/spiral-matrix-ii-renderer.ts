/**
 * 螺旋矩阵 II 可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 59：四边界收缩模拟
 * 遵循 Zero-Subbox 规范，扁平 2D 网格沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SPIRAL_MATRIX_II_PROBLEM_HTML,
  SPIRAL_MATRIX_II_ANALYSIS_HTML,
  SPIRAL_MATRIX_II_CODE_LANGUAGES,
} from './spiral-matrix-ii-problem-content';

export interface SpiralStep {
  n: number;
  matrix: number[][];
  currentRow: number;
  currentCol: number;
  num: number;
  dir: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  status: 'fill' | 'turn' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function clone(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

function boundaryStep(
  n: number,
  matrix: number[][],
  top: number,
  bottom: number,
  left: number,
  right: number,
  dir: string,
  log: string,
  codeLine: number[]
): SpiralStep {
  return {
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: 0,
    dir: '收缩边界',
    top,
    bottom,
    left,
    right,
    status: 'turn',
    message: `完成 ${dir} 方向填充，收缩边界：${log}。`,
    log: `收缩边界: ${log}`,
    codeLine,
  };
}

export function buildSpiralSteps(n: number): SpiralStep[] {
  const steps: SpiralStep[] = [];
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let top = 0,
    bottom = n - 1,
    left = 0,
    right = n - 1;
  let num = 1;

  steps.push({
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: 0,
    dir: '准备',
    top,
    bottom,
    left,
    right,
    status: 'fill',
    message: `初始化边界 top=0, bottom=${bottom}, left=0, right=${right}，准备从 (0,0) 开始顺时针填入 1 ~ ${n * n}。`,
    log: `初始化四边界：top=0, bottom=${bottom}, left=0, right=${right}`,
    codeLine: 2,
  });

  while (num <= n * n) {
    // 1. 向右填充 [top, left] -> [top, right]
    for (let c = left; c <= right && num <= n * n; c++) {
      matrix[top][c] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: top,
        currentCol: c,
        num,
        dir: '👉 向右',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向右填充：在 (${top}, ${c}) 写入 ${num}。`,
        log: `👉 写入 (${top},${c}) = ${num}`,
        codeLine: [4, 5],
      });
      num++;
    }
    top++;
    if (top <= bottom) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向右', `top 下移至 ${top}`, [6]));
    }

    // 2. 向下填充 [top, right] -> [bottom, right]
    for (let r = top; r <= bottom && num <= n * n; r++) {
      matrix[r][right] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: r,
        currentCol: right,
        num,
        dir: '👇 向下',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向下填充：在 (${r}, ${right}) 写入 ${num}。`,
        log: `👇 写入 (${r},${right}) = ${num}`,
        codeLine: [7, 8],
      });
      num++;
    }
    right--;
    if (left <= right) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向下', `right 左移至 ${right}`, [9]));
    }

    // 3. 向左填充 [bottom, right] -> [bottom, left]
    for (let c = right; c >= left && num <= n * n; c--) {
      matrix[bottom][c] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: bottom,
        currentCol: c,
        num,
        dir: '👈 向左',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向左填充：在 (${bottom}, ${c}) 写入 ${num}。`,
        log: `👈 写入 (${bottom},${c}) = ${num}`,
        codeLine: [10, 11],
      });
      num++;
    }
    bottom--;
    if (top <= bottom) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向左', `bottom 上移至 ${bottom}`, [12]));
    }

    // 4. 向上填充 [bottom, left] -> [top, left]
    for (let r = bottom; r >= top && num <= n * n; r--) {
      matrix[r][left] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: r,
        currentCol: left,
        num,
        dir: '👆 向上',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向上填充：在 (${r}, ${left}) 写入 ${num}。`,
        log: `👆 写入 (${r},${left}) = ${num}`,
        codeLine: [13, 14],
      });
      num++;
    }
    left++;
    if (left <= right) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向上', `left 右移至 ${left}`, [15]));
    }
  }

  steps.push({
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: n * n,
    dir: '完成',
    top,
    bottom,
    left,
    right,
    status: 'done',
    message: `🎉 螺旋矩阵 II 全部填满！已成功生成 ${n}×${n} 矩阵。`,
    log: `✓ 完成：已生成 ${n}x${n} 螺旋矩阵`,
    codeLine: 16,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SpiralStep>({
  id: 'spiral-matrix-ii',
  name: '螺旋矩阵 II',
  category: 'array',
  icon: '🌀',
  badge: {
    mode: '四边界收缩模拟',
    complexity: 'O(n²) · O(1)',
  },
  card1Title: '📊 螺旋矩阵 2D 网格填充沙盘',
  card2Title: '🧭 填充方向与四边界坐标监视器',
  card2Desc: '当前填充坐标 (r, c)、前进方向与 [top, bottom, left, right] 边界',
  legend: [
    { label: '当前填充格', color: '#fbbf24' },
    { label: '已填充数字', color: '#10b981' },
    { label: '待填充空格', color: '#cbd5e1' },
  ],
  inputs: [
    {
      id: 'input-n',
      label: '矩阵阶数 n',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '3×3 标准矩阵', values: { 'input-n': 3 } },
    { label: '4×4 偶数阶', values: { 'input-n': 4 } },
    { label: '5×5 奇数阶', values: { 'input-n': 5 } },
  ],
  metrics: [
    { id: 'cur-pos', label: '当前填充坐标 (r, c)', color: '#2563eb' },
    { id: 'fill-dir', label: '当前填充方向', color: '#f59e0b' },
    { id: 'fill-progress', label: '填充进度', color: '#16a34a' },
  ],
  codeLanguages: SPIRAL_MATRIX_II_CODE_LANGUAGES,
  problemHtml: SPIRAL_MATRIX_II_PROBLEM_HTML,
  analysisHtml: SPIRAL_MATRIX_II_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const n = Math.min(6, Math.max(1, parseInt(inputs['input-n'] || '3', 10)));
    return buildSpiralSteps(n);
  },
  renderCanvas: (container, step) => {
    const n = step.n;
    const isDone = step.status === 'done';

    const gridRowsHtml = step.matrix
      .map((row, r) => {
        const cellsHtml = row
          .map((val, c) => {
            const isCur = r === step.currentRow && c === step.currentCol && !isDone;
            const isFilled = val > 0;

            let bg = '#ffffff';
            let border = '#e2e8f0';
            let textColor = '#64748b';

            if (isCur) {
              bg = '#fffbeb';
              border = '#f59e0b';
              textColor = '#b45309';
            } else if (isFilled) {
              bg = '#f0fdf4';
              border = '#86efac';
              textColor = '#166534';
            }

            return `
              <div style="width: 38px; height: 38px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${val > 0 ? val : '·'}
              </div>
            `;
          })
          .join('');

        return `<div style="display: flex; gap: 4px;">${cellsHtml}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px;">
          ${gridRowsHtml}
        </div>
      </div>
    `;

    const root = container.closest('#algo-spiral-matrix-ii-view');
    if (root) {
      const posEl = root.querySelector('#metric-cur-pos');
      const dirEl = root.querySelector('#metric-fill-dir');
      const progEl = root.querySelector('#metric-fill-progress');

      if (posEl) posEl.textContent = step.currentRow >= 0 ? `(${step.currentRow}, ${step.currentCol})` : '—';
      if (dirEl) dirEl.textContent = step.dir;
      if (progEl) progEl.textContent = `${step.num} / ${n * n}`;

      // 在 Card 2 中展示四边界范围
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>四边界坐标:</span>
              <strong style="font-family: monospace; color: #2563eb;">T:${step.top}, B:${step.bottom}, L:${step.left}, R:${step.right}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>当前写入值:</span>
              <strong style="font-family: monospace; color: #16a34a;">${step.num > 0 ? step.num : '准备就绪'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'spiral-matrix-ii',
  name: '螺旋矩阵 II',
  viewId: 'algo-spiral-matrix-ii-view',
  category: 'array',
  description: '四边界顺时针模拟：右下左上依次填充，每完成一条边立刻收缩对应边界',
  icon: '🌀',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握二维矩阵模拟中四边界收缩法的高效无差错边界控制思想',
});
