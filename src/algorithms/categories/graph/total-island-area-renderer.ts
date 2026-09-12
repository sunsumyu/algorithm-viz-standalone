/**
 * 孤岛总面积 (Total Island Area)
 * 声明式 4-Card 标准架构可视化器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TOTAL_ISLAND_AREA_PROBLEM_HTML,
  TOTAL_ISLAND_AREA_ANALYSIS_HTML,
  TOTAL_ISLAND_AREA_CODE_LANGUAGES,
} from './total-island-area-problem-content';

type CellState = 'water' | 'land' | 'visited' | 'explored';

export interface TotalIslandAreaStep {
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
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
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

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典 3 岛屿 [4×5]',
    grid: DEFAULT_GRID,
  },
  single: {
    label: '单座大岛 [4×4]',
    grid: [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  scattered: {
    label: '多散点岛屿 [4×5]',
    grid: [
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 1],
    ],
  },
};

/** 将网格序列化为文本输入（预设值与 inputs.grid 解析共用） */
function gridToText(grid: number[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

function parseGridText(input: string): number[][] {
  const rows = input
    .split(/[\r\n]+|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .replace(/[\[\]\s,，]+/g, '')
        .split('')
        .map((ch) => (ch === '1' ? 1 : 0))
    );
  return rows.length > 0 ? rows : DEFAULT_GRID;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: TotalIslandAreaStep[]): TotalIslandAreaStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-cur-area': `${s.currentArea}`,
      'metric-island-count': `${s.islandCount}`,
      'metric-total-area': `${s.totalArea}`,
      action:
        s.action === 'explore'
          ? `DFS: (${s.currentCell ? s.currentCell.join(',') : ''}) -> currArea = ${s.currentArea}`
          : s.action === 'island-done'
          ? `岛屿结算: totalArea += ${s.currentArea} -> 总面积 = ${s.totalArea}`
          : 'totalArea = sum(islandAreas)',
    },
  }));
}

export function renderTotalIslandAreaCanvas(container: HTMLElement, step: TotalIslandAreaStep): void {
  const { grid, states, rows, cols, currentCell } = step;

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      const st = states[r][c];
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

      let bg = '#f1f5f9';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      let fontWeight = '700';
      if (st === 'visited') {
        bg = '#eff6ff';
        border = '1.5px solid #93c5fd';
        color = '#1d4ed8';
      } else if (st === 'explored') {
        bg = '#f0fdf4';
        border = '1.5px solid #4ade80';
        color = '#15803d';
        fontWeight = '800';
      } else if (val === 1) {
        bg = '#dcfce7';
        border = '1.5px solid #86efac';
        color = '#16a34a';
      }

      let boxShadow = 'none';
      let transform = 'none';
      if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
        bg = '#fef9c3';
        color = '#854d0e';
        transform = 'scale(1.06)';
      }

      html += `<div style="aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: ${fontWeight}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-sizing: border-box; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${boxShadow}; transform: ${transform}; z-index: ${isCurrent ? 10 : 1};"><span>${val}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: 560px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'total-island-area',
  name: '孤岛总面积',
  category: 'graph',
  description: '遍历网格连通分量，计算并累计所有独立岛屿的面积总和',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 18,
  learningGoal: '掌握网格图连通块的面积累加与状态归一化处理',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(DEFAULT_GRID),
      placeholder: '每行如 11000',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.single.label, values: { grid: gridToText(PRESET_CASES.single.grid) } },
    { label: PRESET_CASES.scattered.label, values: { grid: gridToText(PRESET_CASES.scattered.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-cur-area', label: '当前岛屿面积', color: '#f59e0b' },
    { id: 'metric-island-count', label: '岛屿数量', color: '#8b5cf6' },
    { id: 'metric-total-area', label: '总面积', color: '#10b981' },
    { id: 'action', label: '累计公式', color: '#6366f1' },
  ],
  legend: [
    { label: '未访问陆地 (1)', color: '#86efac' },
    { label: '正在探索 (DFS)', color: '#93c5fd' },
    { label: '已计入总面积', color: '#4ade80' },
    { label: '水域 (0)', color: '#94a3b8' },
  ],
  codeLanguages: TOTAL_ISLAND_AREA_CODE_LANGUAGES,
  problemHtml: TOTAL_ISLAND_AREA_PROBLEM_HTML,
  analysisHtml: TOTAL_ISLAND_AREA_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildTotalIslandAreaSteps(parseGridText(String(inputs?.grid ?? '')))),
  renderCanvas: (container, step) =>
    renderTotalIslandAreaCanvas(container, step as TotalIslandAreaStep),
});
