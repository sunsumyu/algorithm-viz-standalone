/**
 * 孤岛总面积 (Total Island Area) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  TOTAL_ISLAND_AREA_PROBLEM_HTML,
  TOTAL_ISLAND_AREA_ANALYSIS_HTML,
  TOTAL_ISLAND_AREA_CODE_LANGUAGES,
} from './total-island-area-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildTotalIslandAreaSteps,
  withTotalIslandMetrics,
  DEFAULT_GRID,
  type TotalIslandAreaStep,
  type TotalIslandCellState,
} from './total-island-area-step-compiler';

export { buildTotalIslandAreaSteps, type TotalIslandAreaStep, type TotalIslandCellState } from './total-island-area-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典 3 岛屿 [4×5]', grid: DEFAULT_GRID },
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

export function renderTotalIslandAreaCanvas(container: HTMLElement, step: TotalIslandAreaStep): void {
  const { grid, states, rows, cols, currentCell } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
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

      return {
        text: val,
        bg,
        border,
        color,
        fontWeight,
        boxShadow,
        transform,
        zIndex: isCurrent ? 10 : 1,
        fontSize: '12px',
      };
    },
  });
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
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_GRID),
      placeholder: '如 11000; 11000',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.single.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.single.grid) } },
    { label: PRESET_CASES.scattered.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.scattered.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-cur-area', label: '当前岛屿面积', color: '#f59e0b' },
    { id: 'metric-island-count', label: '岛屿数量', color: '#8b5cf6' },
    { id: 'metric-total-area', label: '总面积', color: '#10b981' },
    { id: 'action', label: '累计公式', color: '#6366f1' },
  ],
  legend: [
    { label: '独立岛屿 (1)', color: '#16a34a' },
    { label: 'DFS 遍历中', color: '#1d4ed8' },
    { label: '结算已探索', color: '#15803d' },
    { label: '水域 (0)', color: '#cbd5e1' },
  ],
  codeLanguages: TOTAL_ISLAND_AREA_CODE_LANGUAGES,
  problemHtml: TOTAL_ISLAND_AREA_PROBLEM_HTML,
  analysisHtml: TOTAL_ISLAND_AREA_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withTotalIslandMetrics(buildTotalIslandAreaSteps(parseBinaryGrid(inputs?.grid, DEFAULT_GRID))),
  renderCanvas: (container, step) => renderTotalIslandAreaCanvas(container, step as TotalIslandAreaStep),
});
