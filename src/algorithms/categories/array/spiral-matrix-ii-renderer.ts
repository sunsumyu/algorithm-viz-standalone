/**
 * 螺旋矩阵 II 可视化器 — 4-Card 标准现代架构
 * LeetCode 59：四边界收缩模拟
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SPIRAL_MATRIX_II_PROBLEM_HTML,
  SPIRAL_MATRIX_II_ANALYSIS_HTML,
  SPIRAL_MATRIX_II_CODE_LANGUAGES,
} from './spiral-matrix-ii-problem-content';
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
        dir: '右 ➡️',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向右填入 ${num} 到位置 (${top}, ${c})。`,
        log: `填入 matrix[${top}][${c}] = ${num}`,
        codeLine: [4, 5],
      });
      num++;
    }
    top++;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向右', 'top++ -> ' + top, [6]));
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
        dir: '下 ⬇️',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向下填入 ${num} 到位置 (${r}, ${right})。`,
        log: `填入 matrix[${r}][${right}] = ${num}`,
        codeLine: [7, 8],
      });
      num++;
    }
    right--;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向下', 'right-- -> ' + right, [9]));
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
        dir: '左 ⬅️',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向左填入 ${num} 到位置 (${bottom}, ${c})。`,
        log: `填入 matrix[${bottom}][${c}] = ${num}`,
        codeLine: [10, 11],
      });
      num++;
    }
    bottom--;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向左', 'bottom-- -> ' + bottom, [12]));
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
        dir: '上 ⬆️',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向上填入 ${num} 到位置 (${r}, ${left})。`,
        log: `填入 matrix[${r}][${left}] = ${num}`,
        codeLine: [13, 14],
      });
      num++;
    }
    left++;
    if (num <= n * n) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向上', 'left++ -> ' + left, [15]));
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
    message: `🎉 螺旋矩阵生成完毕！所有 ${n * n} 个数字均已顺时针螺旋填入。`,
    log: `算法完成：返回 ${n}×${n} 螺旋矩阵`,
    codeLine: 17,
  });

  return steps;
}

export class SpiralMatrixIIVisualizer extends StepVisualizer<SpiralStep> {
  protected codeLanguages = SPIRAL_MATRIX_II_CODE_LANGUAGES;
  protected codeLines = SPIRAL_MATRIX_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '螺旋矩阵 II 代码调试';

  private gridWrapperEl: HTMLElement | null = null;
  private metricNumEl: HTMLElement | null = null;
  private metricDirEl: HTMLElement | null = null;
  private metricPosEl: HTMLElement | null = null;
  private metricProgEl: HTMLElement | null = null;
  private boundTopEl: HTMLElement | null = null;
  private boundBottomEl: HTMLElement | null = null;
  private boundLeftEl: HTMLElement | null = null;
  private boundRightEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridWrapperEl = this.root.querySelector('#sp-grid-wrapper');
    this.metricNumEl = this.root.querySelector('#metric-num');
    this.metricDirEl = this.root.querySelector('#metric-dir');
    this.metricPosEl = this.root.querySelector('#metric-pos');
    this.metricProgEl = this.root.querySelector('#metric-prog');
    this.boundTopEl = this.root.querySelector('#bound-top');
    this.boundBottomEl = this.root.querySelector('#bound-bottom');
    this.boundLeftEl = this.root.querySelector('#bound-left');
    this.boundRightEl = this.root.querySelector('#bound-right');
    this.liveTextEl = this.root.querySelector('#sp-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.sp-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nInput = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        if (nInput && btn.dataset.n) {
          nInput.value = btn.dataset.n;
          this.start();
        }
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: SPIRAL_MATRIX_II_PROBLEM_HTML,
      analysisHtml: SPIRAL_MATRIX_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SpiralStep[] {
    const nInput = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const n = Math.max(1, Math.min(6, parseInt(nInput?.value || '3', 10) || 3));
    return buildSpiralSteps(n);
  }

  protected renderStep(step: SpiralStep): void {
    const { n, matrix, currentRow, currentCol, num, dir, top, bottom, left, right, status, message } = step;

    // 1. 渲染 2D 矩阵 Grid
    if (this.gridWrapperEl) {
      this.gridWrapperEl.style.gridTemplateColumns = `repeat(${n}, 44px)`;
      let html = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const val = matrix[r][c];
          const isCurrent = currentRow === r && currentCol === c;
          const isFilled = val > 0;

          let boxClasses = 'sp-cell-box';
          if (isCurrent) boxClasses += ' is-current';
          else if (isFilled) boxClasses += ' is-filled';

          html += `
            <div class="sp-cell-wrapper">
              <div class="${boxClasses}">
                <span class="val">${val > 0 ? val : ''}</span>
                <span class="rc">(${r},${c})</span>
              </div>
            </div>
          `;
        }
      }
      this.gridWrapperEl.innerHTML = html;
    }

    // 2. 状态与边界监视器更新
    if (this.metricNumEl) this.metricNumEl.textContent = status === 'done' ? '完成' : `${num}`;
    if (this.metricDirEl) this.metricDirEl.textContent = status === 'done' ? '完成' : `${dir}`;
    if (this.metricPosEl) {
      this.metricPosEl.textContent = currentRow >= 0 && currentCol >= 0 ? `(${currentRow}, ${currentCol})` : '—';
    }
    if (this.metricProgEl) this.metricProgEl.textContent = `${Math.min(num, n * n)} / ${n * n}`;

    if (this.boundTopEl) this.boundTopEl.textContent = `top = ${top}`;
    if (this.boundBottomEl) this.boundBottomEl.textContent = `bottom = ${bottom}`;
    if (this.boundLeftEl) this.boundLeftEl.textContent = `left = ${left}`;
    if (this.boundRightEl) this.boundRightEl.textContent = `right = ${right}`;

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : status === 'fill' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color = status === 'done' ? '#15803d' : status === 'fill' ? '#1d4ed8' : '#334155';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : status === 'fill' ? '#bfdbfe' : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.codeTerminal) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.codeTerminal.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeDir = this.root?.querySelector('#badge-dir');
    if (badgeDir) {
      badgeDir.textContent = status === 'done' ? '生成完毕' : `方向: ${dir}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.codeTerminal) this.codeTerminal.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'spiral-matrix-ii',
  name: '螺旋矩阵 II（模拟）',
  viewId: 'algo-spiral-matrix-ii-view',
  category: 'array',
  description: '顺时针螺旋填充 n×n 矩阵',
  icon: '🌀',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '学会按方向模拟遍历矩阵的思维',
  template,
  Visualizer: SpiralMatrixIIVisualizer,
});
