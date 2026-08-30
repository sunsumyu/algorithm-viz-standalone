/**
 * 岛屿数量可视化器（DFS 网格搜索）— 4-Card 标准现代架构
 * LeetCode 200: 双重循环扫描、深度优先扩散、实时沉岛染色
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  ISLANDS_PROBLEM_HTML,
  ISLANDS_ANALYSIS_HTML,
  ISLANDS_CODE_LANGUAGES,
} from './islands-problem-content';
import template from './islands.html?raw';

export type CellState = 'water' | 'land' | 'visited';

export interface IslandsStep {
  grid: number[][];                 // 原始网格
  states: CellState[][];            // 每格状态
  current: [number, number] | null; // 当前 DFS 访问格
  stack: [number, number][];        // 当前 DFS 栈
  scan: [number, number] | null;    // 外层扫描到的位置
  count: number;                    // 岛屿数
  visitedLand: number;              // 已访问陆地数
  action: 'init' | 'scan' | 'found' | 'enter' | 'mark' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildIslandsSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      stack: extra.stack ? [...extra.stack] : [],
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
    message: `初始化 ${m}×${n} 网格。准备双重循环扫描寻找未访问的陆地 (1)。`,
    log: `初始化网格 ${m}x${n}`,
    codeLine: 2,
  });

  const dfs = (r: number, c: number, callStack: [number, number][]): void => {
    callStack.push([r, c]);
    states[r][c] = 'visited';
    visitedLand++;

    snapshot({
      current: [r, c],
      stack: callStack,
      scan: [r, c],
      action: 'mark',
      message: `DFS 沉岛：标记格 (${r}, ${c}) 为已访问（沉没）。`,
      log: `  沉没陆地 (${r}, ${c})`,
      codeLine: [12, 13],
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        snapshot({
          current: [nr, nc],
          stack: callStack,
          scan: [r, c],
          action: 'enter',
          message: `从 (${r}, ${c}) 向邻格 (${nr}, ${nc}) 发起深度优先扩散。`,
          log: `  深入扩散 (${r},${c}) -> (${nr},${nc})`,
          codeLine: [14, 15, 16, 17],
        });
        dfs(nr, nc, callStack);
      }
    }

    callStack.pop();
    snapshot({
      current: callStack.length > 0 ? callStack[callStack.length - 1] : null,
      stack: callStack,
      scan: [r, c],
      action: 'backtrack',
      message: `回溯：格 (${r}, ${c}) 四周邻格已探索完毕。`,
      log: `  回溯离开 (${r}, ${c})`,
      codeLine: 18,
    });
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        snapshot({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿起点！当前岛屿总数 = ${count}。启动 DFS 沉岛扩散。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c})`,
          codeLine: [5, 6, 7],
        });
        dfs(r, c, []);
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已访问陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: [4, 5],
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 全网格扫描探索完成！共发现 ${count} 座独立岛屿，共计访问 ${visitedLand} 格陆地。`,
    log: `✓ 探索完成: 岛屿总数 = ${count}`,
    codeLine: 10,
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

export class IslandsVisualizer extends StepVisualizer<IslandsStep> {
  protected codeLanguages = ISLANDS_CODE_LANGUAGES;
  protected codeLines = ISLANDS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '岛屿数量 (DFS) 代码调试';

  private currentGrid: number[][] = PRESET_CASES.classic;
  private gridContainer: HTMLElement | null = null;
  private metricScanEl: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricVisitedLandEl: HTMLElement | null = null;
  private metricIslandCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#isl-grid-container');
    this.metricScanEl = this.root.querySelector('#metric-scan');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricVisitedLandEl = this.root.querySelector('#metric-visited-land');
    this.metricIslandCountEl = this.root.querySelector('#metric-island-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#isl-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.isl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caseKey = btn.dataset.case || 'classic';
        if (PRESET_CASES[caseKey]) {
          this.currentGrid = PRESET_CASES[caseKey];
          this.start();
        }
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: ISLANDS_PROBLEM_HTML,
      analysisHtml: ISLANDS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): IslandsStep[] {
    return buildIslandsSteps(this.currentGrid);
  }

  protected renderStep(step: IslandsStep): void {
    const { states, current, scan, count, visitedLand, action, message } = step;
    const m = states.length;
    const n = states[0]?.length || 0;

    // 1. 渲染网格矩阵
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${n}, 44px)`;
      let html = '';
      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          const state = states[r][c];
          const isCurr = current && current[0] === r && current[1] === c;
          const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;

          let cellClass = 'isl-cell';
          if (state === 'water') cellClass += ' is-water';
          else if (state === 'land') cellClass += ' is-land';
          else if (state === 'visited') cellClass += ' is-visited';

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
    if (this.metricVisitedLandEl) this.metricVisitedLandEl.textContent = `${visitedLand}`;
    if (this.metricIslandCountEl) this.metricIslandCountEl.textContent = `${count}`;

    if (this.formulaActionEl) {
      if (action === 'found') {
        this.formulaActionEl.textContent = `发现新岛屿: grid[${scan?.[0]}][${scan?.[1]}] == '1' -> count++ (${count})`;
      } else if (action === 'mark') {
        this.formulaActionEl.textContent = `沉岛染色: grid[${current?.[0]}][${current?.[1]}] = '0' (visited)`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = `探索完毕: 岛屿总数 count = ${count}`;
      } else {
        this.formulaActionEl.textContent = 'dfs(grid, r, c) -> 四向沉岛';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done'
          ? '#f0fdf4'
          : action === 'found'
          ? '#fefce8'
          : action === 'mark'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'found'
          ? '#854d0e'
          : action === 'mark'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'found'
          ? '#fef08a'
          : action === 'mark'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeIslandCount = this.root?.querySelector('#badge-island-count');
    if (badgeIslandCount) badgeIslandCount.textContent = `已发现岛屿: ${count}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'islands',
  name: '岛屿数量 (DFS)',
  viewId: 'algo-islands-view',
  category: 'graph',
  description: '使用深度优先搜索沉岛法计算二维网格中连通岛屿的数量',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握网格图 DFS 连通分量遍历与沉岛染色技巧',
  template,
  Visualizer: IslandsVisualizer,
});
