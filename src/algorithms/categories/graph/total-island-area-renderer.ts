/**
 * 孤岛总面积 (Total Island Area)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TOTAL_ISLAND_AREA_PROBLEM_HTML,
  TOTAL_ISLAND_AREA_ANALYSIS_HTML,
  TOTAL_ISLAND_AREA_CODE_LANGUAGES,
} from './total-island-area-problem-content';
import template from './total-island-area.html?raw';

type CellState = 'water' | 'land' | 'visited' | 'explored';

export interface TotalIslandAreaStep extends StepBase {
  grid: number[][];
  states: CellState[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  currentArea: number;
  totalArea: number;
  islandCount: number;
  action: 'init' | 'scan' | 'found' | 'explore' | 'island-done' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DEFAULT_GRID = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export function buildTotalIslandAreaSteps(grid: number[][] = DEFAULT_GRID): TotalIslandAreaStep[] {
  const steps: TotalIslandAreaStep[] = [];
  const R = grid.length;
  const C = grid[0].length;
  const states: CellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );

  let totalArea = 0;
  let islandCount = 0;
  let currentArea = 0;

  steps.push({
    grid: grid.map((r) => [...r]),
    states: states.map((r) => [...r]),
    rows: R,
    cols: C,
    currentCell: null,
    currentArea: 0,
    totalArea: 0,
    islandCount: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格地图，开始遍历寻找所有连通岛屿并计算总面积。`,
    log: `初始化: ${R}×${C} 网格`,
    codeLine: [1, 2, 3],
  });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (states[r][c] === 'land') {
        islandCount++;
        currentArea = 1;
        states[r][c] = 'visited';

        steps.push({
          grid: grid.map((row) => [...row]),
          states: states.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: [r, c],
          currentArea,
          totalArea,
          islandCount,
          action: 'found',
          statusText: `扫描到 (${r}, ${c}) 为陆地！发现第 ${islandCount} 座岛屿，启动 DFS 探索连通面积。`,
          log: `发现岛屿 #${islandCount} 于 (${r}, ${c})`,
          codeLine: [7, 8, 9],
        });

        const queue: [number, number][] = [[r, c]];
        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && states[nr][nc] === 'land') {
              states[nr][nc] = 'visited';
              currentArea++;
              queue.push([nr, nc]);

              steps.push({
                grid: grid.map((row) => [...row]),
                states: states.map((row) => [...row]),
                rows: R,
                cols: C,
                currentCell: [nr, nc],
                currentArea,
                totalArea,
                islandCount,
                action: 'explore',
                statusText: `DFS 扩展至 (${nr}, ${nc})，当前岛屿面积增长为 ${currentArea}。`,
                log: `扩展陆地 (${nr}, ${nc}) -> 当前岛屿面积 = ${currentArea}`,
                codeLine: [17, 18, 19, 20],
              });
            }
          }
        }

        totalArea += currentArea;
        for (let a = 0; a < R; a++) {
          for (let b = 0; b < C; b++) {
            if (states[a][b] === 'visited') states[a][b] = 'explored';
          }
        }

        steps.push({
          grid: grid.map((row) => [...row]),
          states: states.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: null,
          currentArea,
          totalArea,
          islandCount,
          action: 'island-done',
          statusText: `岛屿 #${islandCount} 探索完成，面积为 ${currentArea} 格。累计总面积更新为 ${totalArea}。`,
          log: `✓ 岛屿 #${islandCount} 结算: 面积 = ${currentArea}，累计总面积 = ${totalArea}`,
          codeLine: 8,
        });
      }
    }
  }

  steps.push({
    grid: grid.map((row) => [...row]),
    states: states.map((row) => [...row]),
    rows: R,
    cols: C,
    currentCell: null,
    currentArea: 0,
    totalArea,
    islandCount,
    action: 'done',
    statusText: `🎉 孤岛总面积统计完成！共发现 ${islandCount} 座独立岛屿，总面积为 ${totalArea} 格。`,
    log: `✓ 统计完成: 岛屿总数 = ${islandCount}，总面积 = ${totalArea}`,
    codeLine: 12,
  });

  return steps;
}

export class TotalIslandAreaVisualizer extends StepVisualizer<TotalIslandAreaStep> {
  protected codeLanguages = TOTAL_ISLAND_AREA_CODE_LANGUAGES;
  protected codeLines = TOTAL_ISLAND_AREA_CODE_LANGUAGES['java'];
  protected codePanelTitle = '孤岛总面积 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridContainer: HTMLElement | null = null;
  private metricCurCellEl: HTMLElement | null = null;
  private metricCurAreaEl: HTMLElement | null = null;
  private metricIslandCountEl: HTMLElement | null = null;
  private metricTotalAreaEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#tia-grid-container');
    this.metricCurCellEl = this.root.querySelector('#metric-cur-cell');
    this.metricCurAreaEl = this.root.querySelector('#metric-cur-area');
    this.metricIslandCountEl = this.root.querySelector('#metric-island-count');
    this.metricTotalAreaEl = this.root.querySelector('#metric-total-area');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#tia-live-text');
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
      problemHtml: TOTAL_ISLAND_AREA_PROBLEM_HTML,
      analysisHtml: TOTAL_ISLAND_AREA_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): TotalIslandAreaStep[] {
    return buildTotalIslandAreaSteps();
  }

  protected renderStep(step: TotalIslandAreaStep): void {
    const { grid, states, rows, cols, currentCell, currentArea, totalArea, islandCount, statusText, action } = step;

    // 1. 渲染 2D 网格
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      let html = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r][c];
          const st = states[r][c];
          const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

          let cls = 'tia-cell';
          if (st === 'explored') cls += ' is-explored';
          else if (st === 'visited') cls += ' is-visited';
          else if (val === 1) cls += ' is-land';
          else cls += ' is-water';

          if (isCurrent) cls += ' is-current';

          html += `<div class="${cls}"><span>${val}</span></div>`;
        }
      }
      this.gridContainer.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricCurCellEl) {
      this.metricCurCellEl.textContent = currentCell ? `(${currentCell[0]}, ${currentCell[1]})` : '—';
    }
    if (this.metricCurAreaEl) {
      this.metricCurAreaEl.textContent = `${currentArea}`;
    }
    if (this.metricIslandCountEl) {
      this.metricIslandCountEl.textContent = `${islandCount}`;
    }
    if (this.metricTotalAreaEl) {
      this.metricTotalAreaEl.textContent = `${totalArea}`;
    }

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent =
        action === 'explore'
          ? `DFS: (${currentCell ? currentCell.join(',') : ''}) -> currArea = ${currentArea}`
          : action === 'island-done'
          ? `岛屿结算: totalArea += ${currentArea} -> 总面积 = ${totalArea}`
          : `totalArea = sum(islandAreas)`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' || action === 'island-done'
          ? '#f0fdf4'
          : action === 'explore' || action === 'found'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done' || action === 'island-done'
          ? '#15803d'
          : action === 'explore' || action === 'found'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' || action === 'island-done'
          ? '#bbf7d0'
          : action === 'explore' || action === 'found'
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

    const badgeTotal = this.root?.querySelector('#badge-total-area');
    if (badgeTotal) badgeTotal.textContent = `总面积: ${totalArea} 格`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'total-island-area',
  name: '孤岛总面积',
  viewId: 'algo-total-island-area-view',
  category: 'graph',
  description: '遍历网格连通分量，计算并累计所有独立岛屿的面积总和',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 18,
  learningGoal: '掌握网格图连通块的面积累加与状态归一化处理',
  template,
  Visualizer: TotalIslandAreaVisualizer,
});
