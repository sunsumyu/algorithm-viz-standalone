/**
 * 岛屿的周长 (LC 463) — 声明式 4-Card 标准架构
 * 逐格扫描陆地并检查 4 邻域暴露边，实时累计海岸线周长
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  COASTLINE_PROBLEM_HTML,
  COASTLINE_ANALYSIS_HTML,
  COASTLINE_CODE_LANGUAGES,
} from './coastline-problem-content';

export interface CLStep {
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
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
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

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典十字岛 [4×4]',
    grid: DEFAULT_GRID,
  },
  ring: {
    label: '环形湖泊岛 [4×5]',
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  single: {
    label: '单格孤岛 [3×3]',
    grid: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
};

/** 将网格序列化为文本输入（预设值与 inputs.grid 解析共用） */
function gridToText(grid: number[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CLStep[]): CLStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-cell-edges': `${s.cellEdges}`,
      'metric-land-count': `${s.landCount}`,
      'metric-total-perimeter': `${s.perimeter}`,
      action:
        s.currentCell && s.cellEdges > 0
          ? `(${s.currentCell[0]}, ${s.currentCell[1]}) 外露边 +${s.cellEdges} -> 累计周长 = ${s.perimeter}`
          : '若邻格越界或为水域 (0)，则周长 perimeter++',
    },
  }));
}

export function renderCoastlineCanvas(container: HTMLElement, step: CLStep): void {
  const { grid, rows, cols, currentCell, exposedEdges } = step;

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      const isLand = val === 1;
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
      const key = `${r},${c}`;
      const cellEdgesArr = exposedEdges[key] || [false, false, false, false];

      let bg = '#f1f5f9';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      if (isLand) {
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
        transform = 'scale(1.05)';
      }

      let edgeDoms = '';
      if (isLand) {
        if (cellEdgesArr[0])
          edgeDoms +=
            '<div style="position: absolute; top: 0; left: 0; right: 0; height: 3.5px; background: #e11d48; border-radius: 4px 4px 0 0;"></div>';
        if (cellEdgesArr[1])
          edgeDoms +=
            '<div style="position: absolute; top: 0; right: 0; bottom: 0; width: 3.5px; background: #e11d48; border-radius: 0 4px 4px 0;"></div>';
        if (cellEdgesArr[2])
          edgeDoms +=
            '<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3.5px; background: #e11d48; border-radius: 0 0 4px 4px;"></div>';
        if (cellEdgesArr[3])
          edgeDoms +=
            '<div style="position: absolute; top: 0; left: 0; bottom: 0; width: 3.5px; background: #e11d48; border-radius: 4px 0 0 4px;"></div>';
      }

      html += `<div style="aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-sizing: border-box; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${boxShadow}; transform: ${transform}; z-index: ${isCurrent ? 10 : 1};">${edgeDoms}<span>${isLand ? '1' : '0'}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: 560px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'coastline',
  name: '岛屿的周长 (LC 463)',
  category: 'graph',
  description: '逐格扫描陆地并检查 4 邻域水域与越界边，实时累计岛屿海岸线周长',
  icon: '🌊',
  difficulty: 1,
  levelOrder: 15,
  learningGoal: '掌握网格 4 邻域边界判定与单格边贡献分析法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(DEFAULT_GRID),
      placeholder: '每行如 0100',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.ring.label, values: { grid: gridToText(PRESET_CASES.ring.grid) } },
    { label: PRESET_CASES.single.label, values: { grid: gridToText(PRESET_CASES.single.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-cell-edges', label: '当前暴露边数', color: '#e11d48' },
    { id: 'metric-land-count', label: '陆地总数', color: '#16a34a' },
    { id: 'metric-total-perimeter', label: '累计周长', color: '#10b981' },
    { id: 'action', label: '累计公式', color: '#6366f1' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#86efac' },
    { label: '水域 (0)', color: '#cbd5e1' },
    { label: '暴露周长边', color: '#e11d48' },
  ],
  codeLanguages: COASTLINE_CODE_LANGUAGES,
  problemHtml: COASTLINE_PROBLEM_HTML,
  analysisHtml: COASTLINE_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildCoastlineSteps(parseBinaryGrid(inputs?.grid, DEFAULT_GRID))),
  renderCanvas: (container, step) => renderCoastlineCanvas(container, step as CLStep),
});
