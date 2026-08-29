/**
 * 沉没孤岛 / 被围绕的区域 (LC 130)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SINK_ISLANDS_PROBLEM_HTML,
  SINK_ISLANDS_ANALYSIS_HTML,
  SINK_ISLANDS_CODE_LANGUAGES,
} from './sink-islands-problem-content';
import template from './sink-islands.html?raw';

export interface SinkStep extends StepBase {
  grid: number[][]; // 0: water/sunk, 1: land, 2: protected
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  stage: string;
  protectedCount: number;
  sunkCount: number;
  action: 'init' | 'border-protect' | 'sink' | 'restore' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DEFAULT_SINK_GRID = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildSinkSteps(initialGrid: number[][] = DEFAULT_SINK_GRID): SinkStep[] {
  const steps: SinkStep[] = [];
  const R = initialGrid.length;
  const C = initialGrid[0].length;
  const grid = initialGrid.map((r) => [...r]);

  let protectedCount = 0;
  let sunkCount = 0;

  steps.push({
    grid: grid.map((r) => [...r]),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '准备开始',
    protectedCount,
    sunkCount,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格。第一阶段：将从四周边缘出发将连通陆地标记为受保护 (2)。`,
    log: `初始化: ${R}×${C} 网格地图`,
    codeLine: [1, 2, 3],
  });

  // 第一阶段：边缘连通 DFS
  const dfsProtect = (r: number, c: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
    grid[r][c] = 2; // protected
    protectedCount++;

    steps.push({
      grid: grid.map((row) => [...row]),
      rows: R,
      cols: C,
      currentCell: [r, c],
      stage: '边缘连通保护',
      protectedCount,
      sunkCount,
      action: 'border-protect',
      statusText: `边缘保护 DFS 访问 (${r}, ${c})，标记为受保护陆地 (2)。当前受保护陆地: ${protectedCount} 格。`,
      log: `保护边沿陆地: (${r}, ${c}) -> 受保护 (2)`,
      codeLine: [19, 20, 21, 22],
    });

    for (const [dr, dc] of DIRS) {
      dfsProtect(r + dr, c + dc);
    }
  };

  // 左右两侧边界
  for (let r = 0; r < R; r++) {
    if (grid[r][0] === 1) dfsProtect(r, 0);
    if (grid[r][C - 1] === 1) dfsProtect(r, C - 1);
  }

  // 上下两侧边界
  for (let c = 0; c < C; c++) {
    if (grid[0][c] === 1) dfsProtect(0, c);
    if (grid[R - 1][c] === 1) dfsProtect(R - 1, c);
  }

  // 第二阶段：淹没孤岛与还原保护区
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) {
        grid[r][c] = 0;
        sunkCount++;
        steps.push({
          grid: grid.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '淹没真正孤岛',
          protectedCount,
          sunkCount,
          action: 'sink',
          statusText: `检测到孤立陆地 (${r}, ${c}) 未与边缘相连，将其淹没为水域 (0)。已淹没孤岛: ${sunkCount} 格。`,
          log: `淹没孤岛: (${r}, ${c}) 1 -> 0`,
          codeLine: 13,
        });
      } else if (grid[r][c] === 2) {
        grid[r][c] = 1;
        steps.push({
          grid: grid.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '还原保护区',
          protectedCount,
          sunkCount,
          action: 'restore',
          statusText: `将受保护陆地 (${r}, ${c}) 还原为正常陆地 (1)。`,
          log: `还原陆地: (${r}, ${c}) 2 -> 1`,
          codeLine: 14,
        });
      }
    }
  }

  steps.push({
    grid: grid.map((row) => [...row]),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '处理完成',
    protectedCount,
    sunkCount,
    action: 'done',
    statusText: `🎉 沉没孤岛计算完成！成功淹没 ${sunkCount} 格被包围的孤立陆地。`,
    log: `✓ 处理完成: 共淹没 ${sunkCount} 格孤岛`,
    codeLine: 17,
  });

  return steps;
}

export class SinkIslandsVisualizer extends StepVisualizer<SinkStep> {
  protected codeLanguages = SINK_ISLANDS_CODE_LANGUAGES;
  protected codeLines = SINK_ISLANDS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '沉没孤岛 (LC 130) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridContainer: HTMLElement | null = null;
  private metricCurCellEl: HTMLElement | null = null;
  private metricStageEl: HTMLElement | null = null;
  private metricProtectedCountEl: HTMLElement | null = null;
  private metricSunkCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#sink-grid-container');
    this.metricCurCellEl = this.root.querySelector('#metric-cur-cell');
    this.metricStageEl = this.root.querySelector('#metric-stage');
    this.metricProtectedCountEl = this.root.querySelector('#metric-protected-count');
    this.metricSunkCountEl = this.root.querySelector('#metric-sunk-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#sink-live-text');
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
      problemHtml: SINK_ISLANDS_PROBLEM_HTML,
      analysisHtml: SINK_ISLANDS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SinkStep[] {
    return buildSinkSteps();
  }

  protected renderStep(step: SinkStep): void {
    const { grid, rows, cols, currentCell, stage, protectedCount, sunkCount, statusText, action } = step;

    // 1. 渲染 2D 网格
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      let html = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r][c];
          const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

          let cls = 'sink-cell';
          let label = String(val);

          if (val === 0) {
            cls += ' is-water';
          } else if (val === 1) {
            cls += ' is-land';
          } else if (val === 2) {
            cls += ' is-protected';
            label = '🛡️';
          }

          if (isCurrent) {
            cls += ' is-current';
            if (action === 'sink') cls += ' is-sunk';
          }

          html += `<div class="${cls}"><span>${label}</span></div>`;
        }
      }
      this.gridContainer.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricCurCellEl) {
      this.metricCurCellEl.textContent = currentCell ? `(${currentCell[0]}, ${currentCell[1]})` : '—';
    }
    if (this.metricStageEl) {
      this.metricStageEl.textContent = stage;
    }
    if (this.metricProtectedCountEl) {
      this.metricProtectedCountEl.textContent = `${protectedCount}`;
    }
    if (this.metricSunkCountEl) {
      this.metricSunkCountEl.textContent = `${sunkCount}`;
    }

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent =
        action === 'border-protect'
          ? `DFS: (${currentCell ? currentCell.join(',') : ''}) 标记为 2 (受保护)`
          : action === 'sink'
          ? `孤岛判定: (${currentCell ? currentCell.join(',') : ''}) 1 -> 0 (淹没)`
          : action === 'restore'
          ? `还原: (${currentCell ? currentCell.join(',') : ''}) 2 -> 1 (保护区保留)`
          : `1. 边缘连通 DFS (1->2) 2. 内部孤岛沉没 (1->0) 与还原 (2->1)`;
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
          : action === 'sink'
          ? '#fef2f2'
          : action === 'border-protect'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'sink'
          ? '#dc2626'
          : action === 'border-protect'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'sink'
          ? '#fecaca'
          : action === 'border-protect'
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

    const badgeSunk = this.root?.querySelector('#badge-sunk-count');
    if (badgeSunk) badgeSunk.textContent = `淹没孤岛: ${sunkCount} 格`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'sink-islands',
  name: '沉没孤岛 (LC 130)',
  viewId: 'algo-sink-islands-view',
  category: 'graph',
  description: '两阶段 DFS：从边界出发标记边缘保护区，将内部所有未相连的孤岛淹没',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握逆向思维边界保护 DFS 遍历与多状态标记法',
  template,
  Visualizer: SinkIslandsVisualizer,
});
