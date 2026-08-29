/**
 * 海岸线计算 - Coastline Perimeter (LC 463)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  COASTLINE_PROBLEM_HTML,
  COASTLINE_ANALYSIS_HTML,
  COASTLINE_CODE_LANGUAGES,
} from './coastline-problem-content';
import template from './coastline.html?raw';

export interface CLStep extends StepBase {
  grid: number[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  exposedEdges: Record<string, boolean[]>; // cell key -> [top, right, bottom, left]
  perimeter: number;
  landCount: number;
  cellEdges: number;
  action: 'init' | 'counting' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DEFAULT_GRID = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [1, 1, 0, 0],
];

const DIR_NAMES = ['上', '右', '下', '左'];
const DIRS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

export function buildCoastlineSteps(grid: number[][] = DEFAULT_GRID): CLStep[] {
  const steps: CLStep[] = [];
  const R = grid.length;
  const C = grid[0].length;

  let landCount = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) landCount++;
    }
  }

  steps.push({
    grid: grid.map((r) => [...r]),
    rows: R,
    cols: C,
    currentCell: null,
    exposedEdges: {},
    perimeter: 0,
    landCount,
    cellEdges: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格，共发现 ${landCount} 个陆地格子。开始逐格检查暴露边。`,
    log: `初始化: ${R}×${C} 网格，陆地总数 = ${landCount}`,
    codeLine: [1, 2, 3],
  });

  const exposedEdges: Record<string, boolean[]> = {};
  let perimeter = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== 1) continue;

      const edges = [false, false, false, false]; // top, right, bottom, left
      let cellEdgeCount = 0;

      for (let d = 0; d < 4; d++) {
        const nr = r + DIRS[d][0];
        const nc = c + DIRS[d][1];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] === 0) {
          edges[d] = true;
          cellEdgeCount++;
          perimeter++;
        }
      }

      const key = `${r},${c}`;
      exposedEdges[key] = [...edges];

      const dirParts: string[] = [];
      for (let d = 0; d < 4; d++) {
        if (edges[d]) dirParts.push(DIR_NAMES[d]);
      }

      steps.push({
        grid: grid.map((r) => [...r]),
        rows: R,
        cols: C,
        currentCell: [r, c],
        exposedEdges: JSON.parse(JSON.stringify(exposedEdges)),
        perimeter,
        landCount,
        cellEdges: cellEdgeCount,
        action: 'counting',
        statusText: `检查陆地格子 (${r}, ${c}): 暴露边 [${dirParts.join(', ')}]，共 ${cellEdgeCount} 条。当前累计周长 = ${perimeter}。`,
        log: `格子 (${r},${c}): +${cellEdgeCount} 边 [${dirParts.join(',')}] → 累计周长 = ${perimeter}`,
        codeLine: [8, 9, 10, 11, 12, 13],
      });
    }
  }

  steps.push({
    grid: grid.map((r) => [...r]),
    rows: R,
    cols: C,
    currentCell: null,
    exposedEdges: JSON.parse(JSON.stringify(exposedEdges)),
    perimeter,
    landCount,
    cellEdges: 0,
    action: 'done',
    statusText: `🎉 海岸线计算完成！总周长 = ${perimeter}。共扫描 ${landCount} 个陆地格子。`,
    log: `✓ 计算完成: 岛屿总周长 = ${perimeter}`,
    codeLine: 18,
  });

  return steps;
}

export class CoastlineVisualizer extends StepVisualizer<CLStep> {
  protected codeLanguages = COASTLINE_CODE_LANGUAGES;
  protected codeLines = COASTLINE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '岛屿周长 (LC 463) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridContainer: HTMLElement | null = null;
  private metricCurCellEl: HTMLElement | null = null;
  private metricCellEdgesEl: HTMLElement | null = null;
  private metricLandCountEl: HTMLElement | null = null;
  private metricTotalPerimeterEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#cl-grid-container');
    this.metricCurCellEl = this.root.querySelector('#metric-cur-cell');
    this.metricCellEdgesEl = this.root.querySelector('#metric-cell-edges');
    this.metricLandCountEl = this.root.querySelector('#metric-land-count');
    this.metricTotalPerimeterEl = this.root.querySelector('#metric-total-perimeter');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#cl-live-text');
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
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 500;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: COASTLINE_PROBLEM_HTML,
      analysisHtml: COASTLINE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CLStep[] {
    return buildCoastlineSteps();
  }

  protected renderStep(step: CLStep): void {
    const { grid, rows, cols, currentCell, exposedEdges, perimeter, landCount, cellEdges, statusText, action } = step;

    // 1. 渲染 2D 网格与暴露边
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      let html = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r][c];
          const isLand = val === 1;
          const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
          const key = `${r},${c}`;
          const cellEdgesArr = exposedEdges[key] || [false, false, false, false];

          let cls = 'cl-cell';
          if (isLand) cls += ' is-land';
          else cls += ' is-water';

          if (isCurrent) cls += ' is-current';

          let edgeDoms = '';
          if (isLand) {
            if (cellEdgesArr[0]) edgeDoms += '<div class="edge-top"></div>';
            if (cellEdgesArr[1]) edgeDoms += '<div class="edge-right"></div>';
            if (cellEdgesArr[2]) edgeDoms += '<div class="edge-bottom"></div>';
            if (cellEdgesArr[3]) edgeDoms += '<div class="edge-left"></div>';
          }

          html += `<div class="${cls}">
            ${edgeDoms}
            <span>${isLand ? '1' : '0'}</span>
          </div>`;
        }
      }
      this.gridContainer.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricCurCellEl) {
      this.metricCurCellEl.textContent = currentCell ? `(${currentCell[0]}, ${currentCell[1]})` : '—';
    }
    if (this.metricCellEdgesEl) {
      this.metricCellEdgesEl.textContent = `${cellEdges}`;
    }
    if (this.metricLandCountEl) {
      this.metricLandCountEl.textContent = `${landCount}`;
    }
    if (this.metricTotalPerimeterEl) {
      this.metricTotalPerimeterEl.textContent = `${perimeter}`;
    }

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent =
        currentCell && cellEdges > 0
          ? `(${currentCell[0]}, ${currentCell[1]}) 外露边 +${cellEdges} -> 累计周长 = ${perimeter}`
          : `若邻格越界或为水域 (0)，则周长 perimeter++`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done'
          ? '#f0fdf4'
          : action === 'counting'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'counting'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'counting'
          ? '#bfdbfe'
          : '#e2e8f0');
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

    const badgePerimeter = this.root?.querySelector('#badge-perimeter');
    if (badgePerimeter) badgePerimeter.textContent = `累计周长: ${perimeter}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'coastline',
  name: '岛屿的周长 (LC 463)',
  viewId: 'algo-coastline-view',
  category: 'graph',
  description: '逐格扫描陆地并检查 4 邻域水域与越界边，实时累计岛屿海岸线周长',
  icon: '🌊',
  difficulty: 1,
  levelOrder: 15,
  learningGoal: '掌握网格 4 邻域边界判定与单格边贡献分析法',
  template,
  Visualizer: CoastlineVisualizer,
});
