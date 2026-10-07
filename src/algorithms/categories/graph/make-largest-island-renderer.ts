/**
 * 最大人工岛 (LC 827) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  MAKE_LARGEST_ISLAND_PROBLEM_HTML,
  MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
  MAKE_LARGEST_ISLAND_CODE_LANGUAGES,
} from './make-largest-island-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildMakeLargestIslandSteps,
  withMLIMetrics,
  DEFAULT_GRID,
  type MLIStep,
} from './make-largest-island-step-compiler';

export { buildMakeLargestIslandSteps, type MLIStep } from './make-largest-island-step-compiler';

const ISLAND_COLORS: Record<number, { bg: string; border: string; color: string }> = {
  2: { bg: '#dcfce7', border: '#86efac', color: '#15803d' },
  3: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' },
  4: { bg: '#faf5ff', border: '#d8b4fe', color: '#7e22ce' },
  5: { bg: '#fff7ed', border: '#fdba74', color: '#c2410c' },
};

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典对角岛 [3×3]', grid: DEFAULT_GRID },
  bigMerge: {
    label: '一桥三岛 [3×5]',
    grid: [
      [1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
    ],
  },
  allWater: { label: '全域水域 [3×3]', grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
};

export function renderMakeLargestIslandCanvas(container: HTMLElement, step: MLIStep): void {
  const { grid, islandId, rows, cols, currentCell, bestCell, action } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const val = grid[r][c];
      const id = islandId[r][c];
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
      const isBest = bestCell && bestCell[0] === r && bestCell[1] === c;

      let bg = '#f8fafc';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      let fontWeight = '700';
      const label = val === 0 ? '0' : `ID:${id}`;

      if (val !== 0) {
        const palette = ISLAND_COLORS[(id % 4) + 2] || ISLAND_COLORS[2];
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

      return {
        text: label,
        bg,
        border,
        color,
        fontWeight,
        boxShadow,
        transform,
        zIndex: isCurrent || isBridge ? 10 : 1,
        fontSize: '11px',
      };
    },
  });
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
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_GRID),
      placeholder: '如 101; 000; 011',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.bigMerge.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.bigMerge.grid) } },
    { label: PRESET_CASES.allWater.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.allWater.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-try-area', label: '当前合并面积', color: '#f59e0b' },
    { id: 'metric-best-cell', label: '最佳桥接点', color: '#ef4444' },
    { id: 'metric-max-area', label: '最大面积', color: '#10b981' },
    { id: 'action', label: '合并公式', color: '#6366f1' },
  ],
  legend: [
    { label: '独立岛屿 ID 染色', color: '#15803d' },
    { label: '水域 (0)', color: '#94a3b8' },
    { label: '填海桥接点', color: '#ef4444' },
    { label: '最佳桥接格', color: '#dc2626' },
  ],
  codeLanguages: MAKE_LARGEST_ISLAND_CODE_LANGUAGES,
  problemHtml: MAKE_LARGEST_ISLAND_PROBLEM_HTML,
  analysisHtml: MAKE_LARGEST_ISLAND_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMLIMetrics(buildMakeLargestIslandSteps(parseBinaryGrid(inputs?.grid, DEFAULT_GRID))),
  renderCanvas: (container, step) => renderMakeLargestIslandCanvas(container, step as MLIStep),
});
