/**
 * 最大人工岛 (LC 827) — 声明式 4-Card 标准架构
 * 两遍扫描：岛屿染色编号缓存面积 + 水域桥接合并求最大面积
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  MAKE_LARGEST_ISLAND_PROBLEM_HTML,
  MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
  MAKE_LARGEST_ISLAND_CODE_LANGUAGES,
} from './make-largest-island-problem-content';

export interface MLIStep {
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
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
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

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典对角岛 [3×3]',
    grid: DEFAULT_GRID,
  },
  bigMerge: {
    label: '一桥三岛 [3×5]',
    grid: [
      [1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
    ],
  },
  allWater: {
    label: '全域水域 [3×3]',
    grid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  },
};

/** 将网格序列化为文本输入（预设值与 inputs.grid 解析共用） */
function gridToText(grid: number[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

/** 岛屿 ID 对应的配色（与图例一致，ID 从 2 开始循环） */
const ISLAND_COLORS: Record<number, { bg: string; border: string; color: string }> = {
  2: { bg: '#dcfce7', border: '#86efac', color: '#15803d' },
  3: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' },
  4: { bg: '#faf5ff', border: '#d8b4fe', color: '#7e22ce' },
  5: { bg: '#fff7ed', border: '#fdba74', color: '#c2410c' },
};

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MLIStep[]): MLIStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-try-area': `${s.tryArea}`,
      'metric-best-cell': s.bestCell ? `(${s.bestCell[0]}, ${s.bestCell[1]})` : '—',
      'metric-max-area': `${s.maxArea}`,
      action:
        s.action === 'try'
          ? `桥接 (${s.currentCell ? s.currentCell.join(',') : ''}): 1 + sum(neighborAreas) = ${s.tryArea}`
          : s.action === 'label'
          ? 'DFS 染色: 岛屿 ID 面积缓存完成'
          : 'curArea = 1 + sum(areaMap[neighborId])',
    },
  }));
}

export function renderMakeLargestIslandCanvas(container: HTMLElement, step: MLIStep): void {
  const { grid, islandId, rows, cols, currentCell, bestCell, action } = step;

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      const id = islandId[r][c];
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
      const isBest = bestCell && bestCell[0] === r && bestCell[1] === c;

      let bg = '#f8fafc';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      let fontWeight = '700';
      let label = val === 0 ? '0' : `ID:${id}`;

      if (val !== 0) {
        const palette = ISLAND_COLORS[id % 4 + 2] || ISLAND_COLORS[2];
        bg = palette.bg;
        border = `1.5px solid ${palette.border}`;
        color = palette.color;
      }

      let boxShadow = 'none';
      let transform = 'none';
      const isBridge = (isCurrent && val === 0) || (action === 'done' && isBest);
      if (isBridge) {
        bg = '#fee2e2';
        border = '2px solid #ef4444';
        color = '#dc2626';
        fontWeight = '900';
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.25)';
      } else if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
      }

      html += `<div style="aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: ${fontWeight}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-sizing: border-box; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${boxShadow}; transform: ${transform}; z-index: ${isCurrent || isBridge ? 10 : 1};"><span>${label}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: 560px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'make-largest-island',
  name: '最大人工岛 (LC 827)',
  category: 'graph',
  description: '两遍扫描法：先对各个独立岛屿染色并缓存面积，再遍历水域桥接相邻岛屿寻找最大合并面积',
  icon: '🏝️',
  difficulty: 3,
  levelOrder: 19,
  learningGoal: '掌握岛屿独立编号染色算法与基于邻接集合的 O(N^2) 填海合并模型',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(DEFAULT_GRID),
      placeholder: '每行如 101',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.bigMerge.label, values: { grid: gridToText(PRESET_CASES.bigMerge.grid) } },
    { label: PRESET_CASES.allWater.label, values: { grid: gridToText(PRESET_CASES.allWater.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-try-area', label: '当前合并面积', color: '#f59e0b' },
    { id: 'metric-best-cell', label: '最佳桥接点', color: '#ef4444' },
    { id: 'metric-max-area', label: '最大面积', color: '#10b981' },
    { id: 'action', label: '合并公式', color: '#6366f1' },
  ],
  legend: [
    { label: '岛屿 2', color: '#86efac' },
    { label: '岛屿 3', color: '#93c5fd' },
    { label: '岛屿 4', color: '#d8b4fe' },
    { label: '最佳桥接点 (0->1)', color: '#ef4444' },
  ],
  codeLanguages: MAKE_LARGEST_ISLAND_CODE_LANGUAGES,
  problemHtml: MAKE_LARGEST_ISLAND_PROBLEM_HTML,
  analysisHtml: MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildMakeLargestIslandSteps(parseBinaryGrid(inputs?.grid, DEFAULT_GRID))),
  renderCanvas: (container, step) => renderMakeLargestIslandCanvas(container, step as MLIStep),
});
