/**
 * 开发商购买土地可视化器 — 4-Card 标准现代架构
 * KamaCoder 44：二维前缀和构建与子矩阵枚举
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BUY_LAND_PROBLEM_HTML,
  BUY_LAND_ANALYSIS_HTML,
  BUY_LAND_CODE_LANGUAGES,
} from './buy-land-problem-content';
import template from './buy-land.html?raw';

export interface BLStep {
  grid: number[][];
  budget: number;
  phase: 'prefix' | 'scan';
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  currentSum: number;
  currentArea: number;
  bestArea: number;
  bestRect: [number, number, number, number] | null;
  prefix: number[][];
  status: 'init' | 'build-prefix' | 'scan-rect' | 'update-best' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseGrid(input: string): number[][] {
  const rows = input.split(/[;；]+/).map((r) => r.trim()).filter(Boolean);
  const grid: number[][] = [];
  for (const r of rows) {
    const nums = r
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (nums.length > 0) grid.push(nums);
  }
  return grid.length > 0
    ? grid
    : [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
}

export function buildBuyLandSteps(grid: number[][], budget: number): BLStep[] {
  const steps: BLStep[] = [];
  const m = grid.length;
  const n = grid[0].length;
  const prefix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  steps.push({
    grid,
    budget,
    phase: 'prefix',
    r1: -1,
    c1: -1,
    r2: -1,
    c2: -1,
    currentSum: 0,
    currentArea: 0,
    bestArea: 0,
    bestRect: null,
    prefix: prefix.map((r) => [...r]),
    status: 'init',
    message: `初始化 ${m}×${n} 网格，预算 budget=${budget}。首先构建二维前缀和数组。`,
    log: `初始化: 矩阵规模 ${m}×${n}, 预算 ${budget}`,
    codeLine: 3,
  });

  // 1. 构建二维前缀和
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];
      steps.push({
        grid,
        budget,
        phase: 'prefix',
        r1: i,
        c1: j,
        r2: i,
        c2: j,
        currentSum: prefix[i + 1][j + 1],
        currentArea: 0,
        bestArea: 0,
        bestRect: null,
        prefix: prefix.map((r) => [...r]),
        status: 'build-prefix',
        message: `计算前缀和 prefix[${i + 1}][${j + 1}] = grid[${i}][${j}] (${grid[i][j]}) + 上 (${prefix[i][j + 1]}) + 左 (${prefix[i + 1][j]}) - 左上 (${prefix[i][j]}) = ${prefix[i + 1][j + 1]}。`,
        log: `前缀和: prefix[${i + 1}][${j + 1}] = ${prefix[i + 1][j + 1]}`,
        codeLine: [4, 5, 6],
      });
    }
  }

  // 2. 枚举子矩阵
  let bestArea = 0;
  let bestRect: [number, number, number, number] | null = null;

  for (let r1 = 0; r1 < m; r1++) {
    for (let c1 = 0; c1 < n; c1++) {
      for (let r2 = r1; r2 < m; r2++) {
        for (let c2 = c1; c2 < n; c2++) {
          const sum =
            prefix[r2 + 1][c2 + 1] -
            prefix[r1][c2 + 1] -
            prefix[r2 + 1][c1] +
            prefix[r1][c1];
          const area = (r2 - r1 + 1) * (c2 - c1 + 1);

          if (sum <= budget) {
            const isNewBest = area > bestArea;
            if (isNewBest) {
              bestArea = area;
              bestRect = [r1, c1, r2, c2];
            }
            steps.push({
              grid,
              budget,
              phase: 'scan',
              r1,
              c1,
              r2,
              c2,
              currentSum: sum,
              currentArea: area,
              bestArea,
              bestRect,
              prefix: prefix.map((r) => [...r]),
              status: isNewBest ? 'update-best' : 'scan-rect',
              message: `检查矩形 [${r1},${c1}]~[${r2},${c2}]：价值和 ${sum} ≤ 预算 ${budget}，面积 ${area}。${isNewBest ? `🌟 刷新最大面积 = ${bestArea}！` : `当前最大面积 ${bestArea}。`}`,
              log: `可行矩形: [${r1},${c1}]~[${r2},${c2}], sum=${sum} <= ${budget}, area=${area}`,
              codeLine: [12, 13, 14],
            });
          }
        }
      }
    }
  }

  steps.push({
    grid,
    budget,
    phase: 'scan',
    r1: bestRect ? bestRect[0] : 0,
    c1: bestRect ? bestRect[1] : 0,
    r2: bestRect ? bestRect[2] : 0,
    c2: bestRect ? bestRect[3] : 0,
    currentSum: 0,
    currentArea: bestArea,
    bestArea,
    bestRect,
    prefix: prefix.map((r) => [...r]),
    status: 'done',
    message: `🎉 搜索完成！在预算 ${budget} 内可购买的最大土地面积为 ${bestArea}${bestRect ? `，对应矩形为 [${bestRect[0]},${bestRect[1]}] 到 [${bestRect[2]},${bestRect[3]}]` : ''}。`,
    log: `算法完成: 最大面积 = ${bestArea}`,
    codeLine: 18,
  });

  return steps;
}

export class BuyLandVisualizer extends StepVisualizer<BLStep> {
  protected codeLanguages = BUY_LAND_CODE_LANGUAGES;
  protected codeLines = BUY_LAND_CODE_LANGUAGES['java'];
  protected codePanelTitle = '购买土地 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridWrapperEl: HTMLElement | null = null;
  private metricRectEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private metricAreaEl: HTMLElement | null = null;
  private metricBestEl: HTMLElement | null = null;
  private formulaSumValEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridWrapperEl = this.root.querySelector('#bl-grid-wrapper');
    this.metricRectEl = this.root.querySelector('#metric-rect');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.metricAreaEl = this.root.querySelector('#metric-area');
    this.metricBestEl = this.root.querySelector('#metric-best');
    this.formulaSumValEl = this.root.querySelector('#formula-sum-val');
    this.liveTextEl = this.root.querySelector('#bl-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.bl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gridInput = this.root?.querySelector('#input-grid') as HTMLInputElement | null;
        const budgetInput = this.root?.querySelector('#input-budget') as HTMLInputElement | null;
        if (gridInput && btn.dataset.grid) gridInput.value = btn.dataset.grid;
        if (budgetInput && btn.dataset.budget) budgetInput.value = btn.dataset.budget;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BUY_LAND_PROBLEM_HTML,
      analysisHtml: BUY_LAND_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BLStep[] {
    const gridInput = this.root?.querySelector('#input-grid') as HTMLInputElement | null;
    const budgetInput = this.root?.querySelector('#input-budget') as HTMLInputElement | null;
    const grid = parseGrid(gridInput?.value || '1,2,3; 4,5,6; 7,8,9');
    const budget = parseInt(budgetInput?.value || '20', 10);
    return buildBuyLandSteps(grid, isNaN(budget) ? 20 : budget);
  }

  protected renderStep(step: BLStep): void {
    const { grid, budget, phase, r1, c1, r2, c2, currentSum, currentArea, bestArea, bestRect, status, message } = step;
    const m = grid.length;
    const n = grid[0].length;

    // 1. 渲染 2D 矩阵 Grid
    if (this.gridWrapperEl) {
      this.gridWrapperEl.style.gridTemplateColumns = `repeat(${n}, 44px)`;
      let html = '';
      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          const val = grid[r][c];
          const inCurrent = phase === 'scan' && r >= r1 && r <= r2 && c >= c1 && c <= c2;
          const inBest = bestRect && r >= bestRect[0] && r <= bestRect[2] && c >= bestRect[1] && c <= bestRect[3];

          let boxClasses = 'bl-cell-box';
          if (inCurrent) boxClasses += ' in-current-rect';
          else if (inBest) boxClasses += ' is-best-rect';

          html += `
            <div class="${boxClasses}" title="(${r}, ${c})">
              ${val}
            </div>
          `;
        }
      }
      this.gridWrapperEl.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricRectEl) {
      this.metricRectEl.textContent = phase === 'scan' ? `(${r1},${c1})~(${r2},${c2})` : '构建前缀中';
    }
    if (this.metricSumEl) {
      this.metricSumEl.textContent = phase === 'scan' ? `${currentSum} ≤ ${budget}` : '—';
    }
    if (this.metricAreaEl) {
      this.metricAreaEl.textContent = phase === 'scan' ? String(currentArea) : '—';
    }
    if (this.metricBestEl) {
      this.metricBestEl.textContent = String(bestArea);
    }
    if (this.formulaSumValEl) {
      this.formulaSumValEl.textContent = String(currentSum);
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : status === 'update-best' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color = status === 'done' ? '#15803d' : status === 'update-best' ? '#1d4ed8' : '#334155';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : status === 'update-best' ? '#bfdbfe' : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
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

    const badgeBest = this.root?.querySelector('#badge-best');
    if (badgeBest) {
      badgeBest.textContent = status === 'done' ? `搜索完成: 最大面积 = ${bestArea}` : `最大面积: ${bestArea}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'buy-land',
  name: '开发商购买土地（二维前缀和）',
  viewId: 'algo-buy-land-view',
  category: 'array',
  description: '在矩阵中寻找和 ≤ 预算的最大面积连续区域',
  icon: '🏞️',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握二维前缀和与子矩阵枚举',
  template,
  Visualizer: BuyLandVisualizer,
});
