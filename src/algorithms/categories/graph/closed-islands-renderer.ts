/**
 * 统计封闭岛屿的数目 (Closed Islands · LeetCode 1254) 声明式可视化适配器
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 150)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  CLOSED_ISLANDS_PROBLEM_HTML,
  CLOSED_ISLANDS_ANALYSIS_HTML,
  CLOSED_ISLANDS_CODE_LANGUAGES,
} from './closed-islands-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildClosedIslandsSteps,
  withClosedIslandsMetrics,
  DEFAULT_CLOSED_GRID,
  type ClosedIslandsStep,
} from './closed-islands-step-compiler';

export { buildClosedIslandsSteps, type ClosedIslandsStep } from './closed-islands-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典用例 2 座封闭岛 [5×8]', grid: DEFAULT_CLOSED_GRID },
  twoIslands: {
    label: '对称双子封闭岛 [4×5]',
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  openBorder: {
    label: '全接触边界 0 封闭岛 [3×5]',
    grid: [
      [0, 0, 1, 1, 0],
      [1, 0, 1, 1, 0],
      [0, 0, 1, 1, 0],
    ],
  },
};

export function renderClosedIslandsCanvas(container: HTMLElement, step: ClosedIslandsStep): void {
  const { states, currentCell, rows, cols } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const state = states[r][c];
      const isCur = currentCell && currentCell[0] === r && currentCell[1] === c;

      const stateStyles: Record<string, { bg: string; color: string; border: string; text: string }> = {
        land: { bg: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', text: '0' },
        water: { bg: '#eff6ff', color: '#93c5fd', border: '1.5px solid #dbeafe', text: '1' },
        'border-sunk': { bg: '#e0f2fe', color: '#0284c7', border: '1.5px solid #38bdf8', text: '🌊' },
        'closed-sunk': { bg: '#fef3c7', color: '#b45309', border: '1.5px solid #f59e0b', text: '🏝️' },
        visiting: { bg: '#dbeafe', color: '#1d4ed8', border: '2px solid #2563eb', text: '0' },
      };

      const base = stateStyles[state] || stateStyles.water;
      const highlight = isCur
        ? {
            bg: '#fee2e2',
            border: '2px solid #ef4444',
            color: '#dc2626',
            transform: 'scale(1.08)',
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.35)',
            zIndex: 10,
          }
        : { transform: 'none', boxShadow: 'none', zIndex: 1 };

      return { ...base, ...highlight };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'closed-islands',
  aliases: ['closed-islands', 'number-of-closed-islands', 'leetcode-1254', '1254'],
  name: '统计封闭岛屿的数目 (Closed Islands)',
  category: 'graph',
  hasDeductionTree: true,
  description: '两阶段泛洪算法：第一阶段排除边界连通伪孤岛，第二阶段统计内陆真正被水域包围的封闭岛屿',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握网格图边界连通块定向淹没技巧与封闭连通块的逆向规约判定模型',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0:陆地, 1:水域)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_CLOSED_GRID),
      placeholder: '如 1111; 1001; 1111',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.twoIslands.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.twoIslands.grid) } },
    { label: PRESET_CASES.openBorder.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.openBorder.grid) } },
  ],
  metrics: [
    { id: 'metric-phase', label: '推演阶段', color: '#3b82f6' },
    { id: 'metric-scan', label: '当前访问格', color: '#fbbf24' },
    { id: 'metric-border-sunk', label: '排除边界陆地', color: '#0284c7' },
    { id: 'metric-closed-count', label: '封闭岛屿总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#6366f1' },
  ],
  legend: [
    { label: '内陆陆地 (0)', color: '#16a34a' },
    { label: '外围水域 (1)', color: '#93c5fd' },
    { label: '边界浸没 (🌊)', color: '#0284c7' },
    { label: '封闭岛沉没 (🏝️)', color: '#b45309' },
  ],
  codeLanguages: CLOSED_ISLANDS_CODE_LANGUAGES,
  problemHtml: CLOSED_ISLANDS_PROBLEM_HTML,
  analysisHtml: CLOSED_ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withClosedIslandsMetrics(buildClosedIslandsSteps(parseBinaryGrid(inputs?.grid, DEFAULT_CLOSED_GRID))),
  renderCanvas: (container, step) => renderClosedIslandsCanvas(container, step as ClosedIslandsStep),
});
