/**
 * 最大人工岛 (LC 827)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MAKE_LARGEST_ISLAND_PROBLEM_HTML,
  MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
  MAKE_LARGEST_ISLAND_CODE_LANGUAGES,
} from './make-largest-island-problem-content';
import template from './make-largest-island.html?raw';

export interface MLIStep extends StepBase {
  grid: number[][];
  islandId: number[][];
  areaMap: Record<number, number>;
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  stage: string;
  tryArea: number;
  maxArea: number;
  bestCell: [number, number] | null;
  action: 'init' | 'label' | 'try' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DEFAULT_GRID = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildMakeLargestIslandSteps(initialGrid: number[][] = DEFAULT_GRID): MLIStep[] {
  const steps: MLIStep[] = [];
  const R = initialGrid.length;
  const C = initialGrid[0].length;
  const grid = initialGrid.map((r) => [...r]);
  const islandId = Array.from({ length: R }, () => Array(C).fill(0));
  const areaMap: Record<number, number> = {};

  steps.push({
    grid: grid.map((r) => [...r]),
    islandId: islandId.map((r) => [...r]),
    areaMap: {},
    rows: R,
    cols: C,
    currentCell: null,
    stage: '准备开始',
    tryArea: 0,
    maxArea: 0,
    bestCell: null,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格。第一阶段：通过 DFS 对各个独立岛屿进行编号染色 (ID >= 2) 并统计面积。`,
    log: `初始化: ${R}×${C} 二进制网格`,
    codeLine: [1, 2, 3],
  });

  let currentId = 2;
  let maxArea = 0;
  let bestCell: [number, number] | null = null;

  // 1. 岛屿染色与面积统计
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1 && islandId[r][c] === 0) {
        let area = 0;
        const queue: [number, number][] = [[r, c]];
        islandId[r][c] = currentId;

        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!;
          area++;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1 && islandId[nr][nc] === 0) {
              islandId[nr][nc] = currentId;
              queue.push([nr, nc]);
            }
          }
        }

        areaMap[currentId] = area;
        if (area > maxArea) {
          maxArea = area;
        }

        steps.push({
          grid: grid.map((row) => [...row]),
          islandId: islandId.map((row) => [...row]),
          areaMap: { ...areaMap },
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '岛屿染色与统计',
          tryArea: area,
          maxArea,
          bestCell,
          action: 'label',
          statusText: `发现新岛屿并染色为 ID=${currentId}，总面积 = ${area}。`,
          log: `岛屿 ID ${currentId}: 染色完成，面积 = ${area}`,
          codeLine: [7, 8, 9, 10],
        });

        currentId++;
      }
    }
  }

  // 2. 第二阶段：遍历水域填海桥接
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0) {
        const seenIds = new Set<number>();
        for (const [dr, dc] of DIRS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && islandId[nr][nc] > 1) {
            seenIds.add(islandId[nr][nc]);
          }
        }

        let curArea = 1; // 填海 0 -> 1 本身贡献 1
        for (const id of seenIds) {
          curArea += areaMap[id] || 0;
        }

        if (curArea > maxArea) {
          maxArea = curArea;
          bestCell = [r, c];
        }

        const neighborStr = Array.from(seenIds).join(', ');
        steps.push({
          grid: grid.map((row) => [...row]),
          islandId: islandId.map((row) => [...row]),
          areaMap: { ...areaMap },
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '尝试水域填海桥接',
          tryArea: curArea,
          maxArea,
          bestCell,
          action: 'try',
          statusText: `尝试在水域 (${r}, ${c}) 填海造陆：连通相邻岛屿 [${neighborStr || '无'}]，合并后总面积 = 1 + ${curArea - 1} = ${curArea}。当前最大面积 = ${maxArea}。`,
          log: `测试水域 (${r},${c}): 合并面积 = ${curArea} (相邻岛屿: ${neighborStr || '无'})`,
          codeLine: [19, 20, 21, 22, 23, 24],
        });
      }
    }
  }

  steps.push({
    grid: grid.map((row) => [...row]),
    islandId: islandId.map((row) => [...row]),
    areaMap: { ...areaMap },
    rows: R,
    cols: C,
    currentCell: bestCell,
    stage: '求解完成',
    tryArea: maxArea,
    maxArea,
    bestCell,
    action: 'done',
    statusText: `🎉 最大人工岛计算完成！最佳填海位置为 ${bestCell ? `(${bestCell[0]}, ${bestCell[1]})` : '无需填海'}，最大可能面积为 ${maxArea} 格。`,
    log: `✓ 求解完成: 最大人工岛面积 = ${maxArea}，最佳桥接点 = ${bestCell ? `(${bestCell[0]}, ${bestCell[1]})` : '无'}`,
    codeLine: 29,
  });

  return steps;
}

export class MakeLargestIslandVisualizer extends StepVisualizer<MLIStep> {
  protected codeLanguages = MAKE_LARGEST_ISLAND_CODE_LANGUAGES;
  protected codeLines = MAKE_LARGEST_ISLAND_CODE_LANGUAGES['java'];
  protected codePanelTitle = '最大人工岛 (LC 827) 代码调试';

  private gridContainer: HTMLElement | null = null;
  private metricCurCellEl: HTMLElement | null = null;
  private metricTryAreaEl: HTMLElement | null = null;
  private metricBestCellEl: HTMLElement | null = null;
  private metricMaxAreaEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#mli-grid-container');
    this.metricCurCellEl = this.root.querySelector('#metric-cur-cell');
    this.metricTryAreaEl = this.root.querySelector('#metric-try-area');
    this.metricBestCellEl = this.root.querySelector('#metric-best-cell');
    this.metricMaxAreaEl = this.root.querySelector('#metric-max-area');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#mli-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MAKE_LARGEST_ISLAND_PROBLEM_HTML,
      analysisHtml: MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MLIStep[] {
    return buildMakeLargestIslandSteps();
  }

  protected renderStep(step: MLIStep): void {
    const { grid, islandId, rows, cols, currentCell, tryArea, maxArea, bestCell, statusText, action } = step;

    // 1. 渲染 2D 网格
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      let html = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r][c];
          const id = islandId[r][c];
          const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
          const isBest = bestCell && bestCell[0] === r && bestCell[1] === c;

          let cls = 'mli-cell';
          let label = val === 0 ? '0' : `ID:${id}`;

          if (val === 0) {
            cls += ' is-water';
          } else {
            cls += ` is-island-${id % 4 + 2}`;
          }

          if (isCurrent) {
            cls += ' is-current';
            if (val === 0) cls += ' is-bridge';
          } else if (action === 'done' && isBest) {
            cls += ' is-bridge';
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
    if (this.metricTryAreaEl) {
      this.metricTryAreaEl.textContent = `${tryArea}`;
    }
    if (this.metricBestCellEl) {
      this.metricBestCellEl.textContent = bestCell ? `(${bestCell[0]}, ${bestCell[1]})` : '—';
    }
    if (this.metricMaxAreaEl) {
      this.metricMaxAreaEl.textContent = `${maxArea}`;
    }

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent =
        action === 'try'
          ? `桥接 (${currentCell ? currentCell.join(',') : ''}): 1 + sum(neighborAreas) = ${tryArea}`
          : action === 'label'
          ? `DFS 染色: 岛屿 ID 面积缓存完成`
          : `curArea = 1 + sum(areaMap[neighborId])`;
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
          : action === 'try'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'try'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'try'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeMax = this.root?.querySelector('#badge-max-area');
    if (badgeMax) badgeMax.textContent = `最大面积: ${maxArea} 格`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'make-largest-island',
  name: '最大人工岛 (LC 827)',
  viewId: 'algo-make-largest-island-view',
  category: 'graph',
  description: '两遍扫描法：先对各个独立岛屿染色并缓存面积，再遍历水域桥接相邻岛屿寻找最大合并面积',
  icon: '🏝️',
  difficulty: 3,
  levelOrder: 19,
  learningGoal: '掌握岛屿独立编号染色算法与基于邻接集合的 O(N^2) 填海合并模型',
  template,
  Visualizer: MakeLargestIslandVisualizer,
});
