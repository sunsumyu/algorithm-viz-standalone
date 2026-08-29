/**
 * 岛屿数量 (BFS 广度优先搜索) 可视化器 — 4-Card 标准现代架构
 * 队列波浪式扩散、入队即时沉岛染色、避免重复进队
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ISLANDS_BFS_PROBLEM_HTML,
  ISLANDS_BFS_ANALYSIS_HTML,
  ISLANDS_BFS_CODE_LANGUAGES,
} from './islands-bfs-problem-content';
import { CellState } from './islands-renderer';
import template from './islands-bfs.html?raw';

export interface IslandsBFSStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  queue: [number, number][];
  scan: [number, number] | null;
  count: number;
  visitedLand: number;
  action: 'init' | 'scan' | 'found' | 'enqueue' | 'poll' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildIslandsBFSSteps(grid: number[][]): IslandsBFSStep[] {
  const steps: IslandsBFSStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsBFSStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      queue: extra.queue ? [...extra.queue] : [],
      scan: extra.scan ?? null,
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 网格。准备双重循环扫描寻找未访问陆地 (1)。`,
    log: `初始化网格 ${m}x${n}`,
    codeLine: 2,
  });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        states[r][c] = 'visited';
        visitedLand++;
        const q: [number, number][] = [[r, c]];

        snapshot({
          scan: [r, c],
          current: [r, c],
          queue: [...q],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿起点！count = ${count}。起点入队并立即染色标记。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c}) 并入队`,
          codeLine: [6, 7, 8, 9],
        });

        while (q.length > 0) {
          const [cr, cc] = q.shift()!;

          snapshot({
            scan: [r, c],
            current: [cr, cc],
            queue: [...q],
            action: 'poll',
            message: `出队 (${cr}, ${cc})：检查四周邻格是否存在连通陆地。`,
            log: `  出队 (${cr}, ${cc})`,
            codeLine: 11,
          });

          for (const [dr, dc] of dirs) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
              states[nr][nc] = 'visited';
              visitedLand++;
              q.push([nr, nc]);

              snapshot({
                scan: [r, c],
                current: [nr, nc],
                queue: [...q],
                action: 'enqueue',
                message: `发现邻接陆地 (${nr}, ${nc})：立即染色沉没并推入队列。`,
                log: `  发现陆地 (${nr}, ${nc}) -> 入队`,
                codeLine: [14, 15, 16],
              });
            }
          }
        }
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已访问陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: 5,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 全网格 BFS 扫描探索完成！共发现 ${count} 座独立岛屿，共计访问 ${visitedLand} 格陆地。`,
    log: `✓ BFS 探索完成: 岛屿总数 = ${count}`,
    codeLine: 20,
  });

  return steps;
}

const PRESET_CASES: Record<string, number[][]> = {
  classic: [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
  ],
  single: [
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  scattered: [
    [1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

export class IslandsBFSVisualizer extends StepVisualizer<IslandsBFSStep> {
  protected codeLanguages = ISLANDS_BFS_CODE_LANGUAGES;
  protected codeLines = ISLANDS_BFS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '岛屿数量 (BFS) 代码调试';

  private currentGrid: number[][] = PRESET_CASES.classic;
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridContainer: HTMLElement | null = null;
  private metricScanEl: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricQSizeEl: HTMLElement | null = null;
  private metricIslandCountEl: HTMLElement | null = null;
  private queueElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#isl-bfs-grid-container');
    this.metricScanEl = this.root.querySelector('#metric-scan');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricQSizeEl = this.root.querySelector('#metric-q-size');
    this.metricIslandCountEl = this.root.querySelector('#metric-island-count');
    this.queueElementsEl = this.root.querySelector('#queue-elements');
    this.liveTextEl = this.root.querySelector('#isl-live-text');
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
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 400;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.isl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseKey = btn.dataset.case || 'classic';
        if (PRESET_CASES[caseKey]) {
          this.currentGrid = PRESET_CASES[caseKey];
          this.start();
        }
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: ISLANDS_BFS_PROBLEM_HTML,
      analysisHtml: ISLANDS_BFS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): IslandsBFSStep[] {
    return buildIslandsBFSSteps(this.currentGrid);
  }

  protected renderStep(step: IslandsBFSStep): void {
    const { states, current, queue, scan, count, message } = step;
    const m = states.length;
    const n = states[0]?.length || 0;

    // 1. 渲染网格矩阵
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${n}, 44px)`;
      const qSet = new Set(queue.map(([r, c]) => `${r},${c}`));
      let html = '';
      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          const state = states[r][c];
          const isCurr = current && current[0] === r && current[1] === c;
          const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;
          const inQueue = qSet.has(`${r},${c}`);

          let cellClass = 'isl-cell';
          if (state === 'water') cellClass += ' is-water';
          else if (state === 'land') cellClass += ' is-land';
          else if (state === 'visited') cellClass += ' is-visited';

          if (inQueue) cellClass += ' is-in-queue';
          if (isCurr) cellClass += ' is-current';
          if (isScan) cellClass += ' is-scanning';

          const text = state === 'water' ? '0' : state === 'land' ? '1' : '✓';
          html += `<div class="${cellClass}">${text}</div>`;
        }
      }
      this.gridContainer.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricScanEl) this.metricScanEl.textContent = scan ? `(${scan[0]}, ${scan[1]})` : '—';
    if (this.metricCurrEl) this.metricCurrEl.textContent = current ? `(${current[0]}, ${current[1]})` : '—';
    if (this.metricQSizeEl) this.metricQSizeEl.textContent = `${queue.length}`;
    if (this.metricIslandCountEl) this.metricIslandCountEl.textContent = `${count}`;

    if (this.queueElementsEl) {
      this.queueElementsEl.textContent =
        queue.length > 0 ? `[ ${queue.map(([r, c]) => `(${r},${c})`).join(', ')} ]` : '[ (空) ]';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        step.action === 'done'
          ? '#f0fdf4'
          : step.action === 'found'
          ? '#fefce8'
          : step.action === 'enqueue'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        step.action === 'done'
          ? '#15803d'
          : step.action === 'found'
          ? '#854d0e'
          : step.action === 'enqueue'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (step.action === 'done'
          ? '#bbf7d0'
          : step.action === 'found'
          ? '#fef08a'
          : step.action === 'enqueue'
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
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
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
  id: 'islands-bfs',
  name: '岛屿数量 (BFS)',
  viewId: 'algo-islands-bfs-view',
  category: 'graph',
  description: '使用广度优先搜索队列波浪式染色计算二维网格中连通岛屿的数量',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握网格图 BFS 逐层扩散与入队即染色的内存控制技巧',
  template,
  Visualizer: IslandsBFSVisualizer,
});
