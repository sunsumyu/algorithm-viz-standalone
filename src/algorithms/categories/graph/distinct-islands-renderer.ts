/**
 * 不同岛屿的数量 (Distinct Islands · LeetCode 694) 声明式可视化适配器
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 150)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DISTINCT_ISLANDS_PROBLEM_HTML,
  DISTINCT_ISLANDS_ANALYSIS_HTML,
  DISTINCT_ISLANDS_CODE_LANGUAGES,
} from './distinct-islands-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildDistinctIslandsSteps,
  withDistinctIslandsMetrics,
  DEFAULT_DISTINCT_GRID,
  type DistinctIslandsStep,
} from './distinct-islands-step-compiler';

export { buildDistinctIslandsSteps, type DistinctIslandsStep } from './distinct-islands-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典全等平移 [2 座同构岛 ➔ 1 种形态 4×5]',
    grid: DEFAULT_DISTINCT_GRID,
  },
  distinct: {
    label: '经典三形态 [3 种不同形状 4×5]',
    grid: [
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
    ],
  },
  threeShapes: {
    label: '复合几何形状 [5×5]',
    grid: [
      [1, 1, 0, 1, 1],
      [1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1],
      [0, 1, 0, 1, 1],
    ],
  },
};

export function renderDistinctIslandsCanvas(container: HTMLElement, step: DistinctIslandsStep): void {
  const { states, currentCell, originCell, rows, cols } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const state = states[r][c];
      const isCur = currentCell && currentCell[0] === r && currentCell[1] === c;
      const isOrigin = originCell && originCell[0] === r && originCell[1] === c;

      const stateStyles: Record<string, { bg: string; color: string; border: string; text: string }> = {
        land: { bg: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', text: '1' },
        water: { bg: '#eff6ff', color: '#93c5fd', border: '1.5px solid #dbeafe', text: '0' },
        origin: { bg: '#fef3c7', color: '#b45309', border: '2px solid #f59e0b', text: '⚓' },
        sunk: { bg: '#dcfce7', color: '#15803d', border: '1.5px solid #22c55e', text: '✓' },
        visiting: { bg: '#dbeafe', color: '#1d4ed8', border: '2px solid #2563eb', text: '1' },
      };

      const base = isOrigin ? stateStyles.origin : stateStyles[state] || stateStyles.water;
      const highlight = isCur
        ? {
            transform: 'scale(1.08)',
            boxShadow: '0 0 0 3px rgba(234, 179, 8, 0.45)',
            zIndex: 10,
          }
        : { transform: 'none', boxShadow: 'none', zIndex: 1 };

      return { ...base, ...highlight };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'distinct-islands',
  aliases: ['distinct-islands', 'number-of-distinct-islands', 'leetcode-694', '694'],
  name: '不同岛屿的数量 (Distinct Islands)',
  category: 'graph',
  hasDeductionTree: true,
  description: '平移不变性几何形状哈希化：以首个陆地为锚点原点序列化相对偏移坐标，利用哈希集合统计不同形状数量',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 24,
  learningGoal: '深刻理解几何连通分量的平移不变性、基准锚点相对坐标归一化以及形状签名序列化模型',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_DISTINCT_GRID),
      placeholder: '如 11000; 11000',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.distinct.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.distinct.grid) } },
    { label: PRESET_CASES.threeShapes.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.threeShapes.grid) } },
  ],
  metrics: [
    { id: 'metric-scan', label: '当前访问格', color: '#fbbf24' },
    { id: 'metric-origin', label: '锚点基准原点', color: '#f59e0b' },
    { id: 'metric-sig', label: '当前形状签名', color: '#8b5cf6' },
    { id: 'metric-total-islands', label: '已探测岛屿数', color: '#3b82f6' },
    { id: 'metric-distinct-count', label: '独立形状总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#6366f1' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#93c5fd' },
    { label: '形状基准锚点 (⚓)', color: '#f59e0b' },
    { label: '已沉没连通格 (✓)', color: '#15803d' },
  ],
  codeLanguages: DISTINCT_ISLANDS_CODE_LANGUAGES,
  problemHtml: DISTINCT_ISLANDS_PROBLEM_HTML,
  analysisHtml: DISTINCT_ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withDistinctIslandsMetrics(buildDistinctIslandsSteps(parseBinaryGrid(inputs?.grid, DEFAULT_DISTINCT_GRID))),
  renderCanvas: (container, step) => renderDistinctIslandsCanvas(container, step as DistinctIslandsStep),
});
