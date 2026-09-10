/**
 * 岛屿的最大面积可视化器 — 4-Card 标准现代架构
 * DFS 面积累加递归、实时沉岛与全局最大值动态追踪
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MAX_ISLAND_AREA_PROBLEM_HTML,
  MAX_ISLAND_AREA_ANALYSIS_HTML,
  MAX_ISLAND_AREA_CODE_LANGUAGES,
} from './max-island-area-problem-content';
import { CellState } from './islands-renderer';
import template from './max-island-area.html?raw';

export interface MIAStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  currentArea: number;
  maxArea: number;
  action: 'init' | 'scan' | 'found' | 'mark' | 'accumulate' | 'update-max' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildMIASteps(grid: number[][]): MIAStep[] {
  const steps: MIAStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let maxArea = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<MIAStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      currentArea: extra.currentArea ?? 0,
      maxArea,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 二进制矩阵。准备扫描统计最大岛屿面积。`,
    log: `初始化矩阵 ${m}x${n}`,
    codeLine: 2,
  });

  const dfs = (r: number, c: number, runningAreaRef: { val: number }): number => {
    if (r < 0 || r >= m || c < 0 || c >= n || states[r][c] !== 'land') {
      return 0;
    }

    states[r][c] = 'visited';
    runningAreaRef.val++;
    let myArea = 1;

    snapshot({
      current: [r, c],
      scan: [r, c],
      currentArea: runningAreaRef.val,
      action: 'mark',
      message: `访问并沉没陆地 (${r}, ${c})，当前岛屿面积累加至 ${runningAreaRef.val}。`,
      log: `  沉没陆地 (${r}, ${c}) -> 面积=${runningAreaRef.val}`,
      codeLine: [12, 13],
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        myArea += dfs(nr, nc, runningAreaRef);
      }
    }

    return myArea;
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        const areaRef = { val: 0 };
        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: 0,
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿！启动 DFS 递归计算该连通块面积。`,
          log: `发现新岛屿起点 (${r}, ${c})`,
          codeLine: [5, 6],
        });

        const thisArea = dfs(r, c, areaRef);
        const prevMax = maxArea;
        maxArea = Math.max(maxArea, thisArea);

        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: thisArea,
          action: 'update-max',
          message: `岛屿面积计算完毕：${thisArea}。更新全局最大面积 max(${prevMax}, ${thisArea}) = ${maxArea}。`,
          log: `本岛面积=${thisArea}, maxArea=${maxArea}`,
          codeLine: 6,
        });
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          currentArea: 0,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已统计陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): 跳过`,
          codeLine: [4, 5],
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    currentArea: 0,
    message: `🎉 全网格扫描探索完成！最大岛屿面积为 ${maxArea}。`,
    log: `✓ 统计完成: maxArea = ${maxArea}`,
    codeLine: 9,
  });

  return steps;
}

const PRESET_CASES: Record<string, number[][]> = {
  classic: [
    [0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0],
    [0, 1, 0, 0, 1],
    [0, 0, 0, 1, 1],
  ],
  large: [
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  empty: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
};

export class MaxIslandAreaVisualizer extends StepVisualizer<MIAStep> {
  protected codeLanguages = MAX_ISLAND_AREA_CODE_LANGUAGES;
  protected codeLines = MAX_ISLAND_AREA_CODE_LANGUAGES['java'];
  protected codePanelTitle = '岛屿的最大面积 代码调试';

  private currentGrid: number[][] = PRESET_CASES.classic;
  private gridContainer: HTMLElement | null = null;
  private metricScanEl: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricCurAreaEl: HTMLElement | null = null;
  private metricMaxAreaEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#mia-grid-container');
    this.metricScanEl = this.root.querySelector('#metric-scan');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricCurAreaEl = this.root.querySelector('#metric-cur-area');
    this.metricMaxAreaEl = this.root.querySelector('#metric-max-area');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#mia-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.mia-chip').forEach((btn) => {
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
      problemHtml: MAX_ISLAND_AREA_PROBLEM_HTML,
      analysisHtml: MAX_ISLAND_AREA_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MIAStep[] {
    return buildMIASteps(this.currentGrid);
  }

  protected renderStep(step: MIAStep): void {
    const { states, current, scan, currentArea, maxArea, action, message } = step;
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

          let cellClass = 'mia-cell';
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
    if (this.metricCurAreaEl) this.metricCurAreaEl.textContent = `${currentArea}`;
    if (this.metricMaxAreaEl) this.metricMaxAreaEl.textContent = `${maxArea}`;

    if (this.formulaActionEl) {
      if (action === 'update-max') {
        this.formulaActionEl.textContent = `更新最大面积: maxArea = Math.max(maxArea, ${currentArea}) -> ${maxArea}`;
      } else if (action === 'mark') {
        this.formulaActionEl.textContent = `沉岛累加: grid[${current?.[0]}][${current?.[1]}] = 0 (area=${currentArea})`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = `探索完毕: 最大面积 maxArea = ${maxArea}`;
      } else {
        this.formulaActionEl.textContent = 'area = 1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)';
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
          : action === 'update-max'
          ? '#fefce8'
          : action === 'mark'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'update-max'
          ? '#854d0e'
          : action === 'mark'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'update-max'
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

    const badgeMaxArea = this.root?.querySelector('#badge-max-area');
    if (badgeMaxArea) badgeMaxArea.textContent = `最大面积: ${maxArea}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'max-island-area',
  name: '岛屿的最大面积',
  viewId: 'algo-max-island-area-view',
  category: 'graph',
  description: '使用深度优先搜索计算并返回网格中最大连通岛屿的面积',
  icon: '📐',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握 DFS 递归计数与全局极值维护的经典网格图解法',
  template,
  Visualizer: MaxIslandAreaVisualizer,
});
