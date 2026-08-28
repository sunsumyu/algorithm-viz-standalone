/**
 * 螺旋矩阵 II 可视化器（模拟）
 * LeetCode 59
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './spiral-matrix-ii.html?raw';

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

export function buildSpiralSteps(n: number): SpiralStep[] {
  const steps: SpiralStep[] = [];
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let top = 0, bottom = n - 1, left = 0, right = n - 1;
  let num = 1;

  steps.push({
    n, matrix: clone(matrix), currentRow: -1, currentCol: -1, num: 0, dir: '准备', top, bottom, left, right, status: 'fill',
    message: `初始化边界 top=0, bottom=${bottom}, left=0, right=${right}，从 (0,0) 开始向右填充。`,
    log: '初始化四边界。',
    codeLine: [2],
  });

  while (num <= n * n) {
    // 1. 向右填充 [top, left] -> [top, right]
    for (let c = left; c <= right && num <= n * n; c++) {
      matrix[top][c] = num;
      steps.push({
        n, matrix: clone(matrix), currentRow: top, currentCol: c, num, dir: '右', top, bottom, left, right, status: 'fill',
        message: `向右填入 ${num} 到位置 (${top},${c})。`,
        log: `填 matrix[${top}][${c}] = ${num}。`,
        codeLine: [4, 5],
      });
      num++;
    }
    top++;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '右', 'top++ -> ' + top, [12]));
    }

    // 2. 向下填充 [top, right] -> [bottom, right]
    for (let r = top; r <= bottom && num <= n * n; r++) {
      matrix[r][right] = num;
      steps.push({
        n, matrix: clone(matrix), currentRow: r, currentCol: right, num, dir: '下', top, bottom, left, right, status: 'fill',
        message: `向下填入 ${num} 到位置 (${r},${right})。`,
        log: `填 matrix[${r}][${right}] = ${num}。`,
        codeLine: [6, 7],
      });
      num++;
    }
    right--;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '下', 'right-- -> ' + right, [13]));
    }

    // 3. 向左填充 [bottom, right] -> [bottom, left]
    for (let c = right; c >= left && num <= n * n; c--) {
      matrix[bottom][c] = num;
      steps.push({
        n, matrix: clone(matrix), currentRow: bottom, currentCol: c, num, dir: '左', top, bottom, left, right, status: 'fill',
        message: `向左填入 ${num} 到位置 (${bottom},${c})。`,
        log: `填 matrix[${bottom}][${c}] = ${num}。`,
        codeLine: [8, 9],
      });
      num++;
    }
    bottom--;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '左', 'bottom-- -> ' + bottom, [14]));
    }

    // 4. 向上填充 [bottom, left] -> [top, left]
    for (let r = bottom; r >= top && num <= n * n; r--) {
      matrix[r][left] = num;
      steps.push({
        n, matrix: clone(matrix), currentRow: r, currentCol: left, num, dir: '上', top, bottom, left, right, status: 'fill',
        message: `向上填入 ${num} 到位置 (${r},${left})。`,
        log: `填 matrix[${r}][${left}] = ${num}。`,
        codeLine: [10, 11],
      });
      num++;
    }
    left++;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '上', 'left++ -> ' + left, [15]));
    }
  }

  steps.push({
    n, matrix: clone(matrix), currentRow: -1, currentCol: -1, num: n * n, dir: '完成', top, bottom, left, right, status: 'done',
    message: `填数完成，共填入 ${n * n} 个数。`,
    log: '返回矩阵。',
    codeLine: 17,
  });
  return steps;
}

function clone(m: number[][]): number[][] {
  return m.map((row) => [...row]);
}

function boundaryStep(n: number, matrix: number[][], top: number, bottom: number, left: number, right: number, dir: string, log: string, codeLine: number[]): SpiralStep {
  return {
    n, matrix: clone(matrix), currentRow: -1, currentCol: -1, num: 0, dir, top, bottom, left, right, status: 'turn',
    message: `向${dir}填完一条边，收缩边界：${log}。`,
    log: `收缩边界 ${log}。`,
    codeLine,
  };
}

export class SpiralMatrixIIVisualizer extends StepVisualizer<SpiralStep> {
  protected codeLines = [
    'public int[][] generateMatrix(int n) {',
    '    int[][] matrix = new int[n][n];',
    '    int top = 0, bottom = n - 1, left = 0, right = n - 1, num = 1;',
    '    while (num <= n * n) {',
    '        // 向右',
    '        for (int c = left; c <= right; c++) matrix[top][c] = num++;',
    '        top++;',
    '        // 向下',
    '        for (int r = top; r <= bottom; r++) matrix[r][right] = num++;',
    '        right--;',
    '        // 向左',
    '        for (int c = right; c >= left; c--) matrix[bottom][c] = num++;',
    '        bottom--;',
    '        // 向上',
    '        for (int r = bottom; r >= top; r--) matrix[r][left] = num++;',
    '        left++;',
    '    }',
    '    return matrix;',
    '}',
  ];
  protected codePanelTitle = '螺旋矩阵 Java 实现';

  private nInput: HTMLInputElement | null = null;
  private gridWrap: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private numEl: HTMLElement | null = null;
  private dirEl: HTMLElement | null = null;
  private rowbEl: HTMLElement | null = null;
  private colbEl: HTMLElement | null = null;
  private currentN = 4;
  /** 持久化网格容器（复用，仅更新 gridTemplateColumns） */
  private gridEl: HTMLElement | null = null;
  /** 持久化 cell（一维，按 r*n + c） */
  private cellGrid: HTMLElement[] = [];
  /** 当前网格边长，用于检测变化重建 */
  private renderedN = 0;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.nInput = this.root.querySelector('#sp-n-input');
    this.btnStart = this.root.querySelector('#sp-start');
    this.gridWrap = this.root.querySelector('#sp-grid-wrap');
    this.logEl = this.root.querySelector('#sp-log');
    this.numEl = this.root.querySelector('#sp-num');
    this.dirEl = this.root.querySelector('#sp-dir');
    this.rowbEl = this.root.querySelector('#sp-rowb');
    this.colbEl = this.root.querySelector('#sp-colb');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): SpiralStep[] {
    let n = parseInt(this.nInput?.value || '4', 10);
    if (!Number.isFinite(n)) n = 4;
    n = Math.max(1, Math.min(8, n));
    if (this.nInput) this.nInput.value = String(n);
    this.currentN = n;
    return buildSpiralSteps(n);
  }

  protected renderStep(step: SpiralStep): void {
    if (this.numEl) this.numEl.textContent = String(step.num);
    if (this.dirEl) this.dirEl.textContent = step.dir;
    if (this.rowbEl) this.rowbEl.textContent = `${step.top}/${step.bottom}`;
    if (this.colbEl) this.colbEl.textContent = `${step.left}/${step.right}`;

    // 当前填充方向标记到 gridWrap，CSS 据此显示方向箭头
    if (this.gridWrap) {
      const dirMap: Record<string, string> = { '右': 'right', '下': 'down', '左': 'left', '上': 'up' };
      this.gridWrap.dataset.dir = dirMap[step.dir] || (step.status === 'done' ? 'done' : 'idle');
    }

    if (this.gridWrap) {
      this.ensureGrid(step.n);
      for (let r = 0; r < step.n; r++) {
        for (let c = 0; c < step.n; c++) {
          const idx = r * step.n + c;
          const cell = this.cellGrid[idx];
          if (!cell) continue;
          const val = step.matrix[r][c];
          const isFilled = val !== 0;
          const isCurrent = r === step.currentRow && c === step.currentCol;

          cell.classList.toggle('filled', isFilled);
          cell.classList.toggle('current', isCurrent);
          // 螺旋轨迹：已填 cell 微弱发光，当前填的 cell 最亮
          cell.classList.toggle('trail', isFilled && !isCurrent && step.status !== 'done');

          // 新填入触发 filling 发光动画
          if (isCurrent && step.status === 'fill' && isFilled) {
            this.restartAnimation(cell, 'filling');
          } else {
            cell.classList.remove('filling');
          }

          cell.textContent = isFilled ? String(val) : '';
        }
      }
    }
    this.renderLogLine(step);
  }

  /** 确保网格容器与 cell 数量匹配当前 n（n 变化时整体重建） */
  private ensureGrid(n: number): void {
    if (!this.gridWrap) return;
    // n 变化时，清空并重建网格容器 + 全部 cell
    if (this.renderedN !== n || !this.gridEl || this.gridEl.parentElement !== this.gridWrap) {
      this.gridWrap.innerHTML = '';
      this.cellGrid = [];
      const grid = document.createElement('div');
      grid.className = 'sp-grid';
      grid.style.gridTemplateColumns = `repeat(${n}, 52px)`;
      this.gridWrap.appendChild(grid);
      this.gridEl = grid;
      this.renderedN = n;
      const total = n * n;
      for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.className = 'sp-cell';
        this.cellGrid.push(cell);
        grid.appendChild(cell);
      }
      return;
    }
    // n 不变：cell 已复用，无需操作
  }

  /** 重启 CSS 动画 class */
  private restartAnimation(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  private renderLogLine(step: SpiralStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'spiral-matrix-ii',
  name: '螺旋矩阵 II（模拟）',
  viewId: 'algo-spiral-matrix-ii-view',
  category: 'array',
  description: '顺时针螺旋填充 n×n 矩阵',
  icon: '🌀',
  template,
  Visualizer: SpiralMatrixIIVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '学会按方向模拟遍历矩阵的思维',
});
