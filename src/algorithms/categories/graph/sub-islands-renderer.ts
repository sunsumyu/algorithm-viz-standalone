/**
 * 统计子岛屿 (Count Sub Islands · LeetCode 1905) 声明式可视化适配器
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 150)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SUB_ISLANDS_PROBLEM_HTML,
  SUB_ISLANDS_ANALYSIS_HTML,
  SUB_ISLANDS_CODE_LANGUAGES,
} from './sub-islands-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildSubIslandsSteps,
  withSubIslandsMetrics,
  DEFAULT_GRID1,
  DEFAULT_GRID2,
  type SubIslandsStep,
} from './sub-islands-step-compiler';

export { buildSubIslandsSteps, type SubIslandsStep } from './sub-islands-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid1: number[][]; grid2: number[][] }> = {
  classic: {
    label: '经典 3 座子岛 [5×5]',
    grid1: DEFAULT_GRID1,
    grid2: DEFAULT_GRID2,
  },
  example2: {
    label: '交错 2 座子岛 [5×5]',
    grid1: [
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
    ],
    grid2: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
};

export function renderSubIslandsCanvas(container: HTMLElement, step: SubIslandsStep): void {
  const { states2, currentCell, rows, cols } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const state = states2[r][c];
      const isCur = currentCell && currentCell[0] === r && currentCell[1] === c;

      const stateStyles: Record<string, { bg: string; color: string; border: string; text: string }> = {
        land: { bg: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', text: '1' },
        water: { bg: '#eff6ff', color: '#93c5fd', border: '1.5px solid #dbeafe', text: '0' },
        conflict: { bg: '#fee2e2', color: '#dc2626', border: '2px solid #ef4444', text: '❌' },
        excluded: { bg: '#e0f2fe', color: '#0284c7', border: '1.5px solid #38bdf8', text: '🌊' },
        'sub-island': { bg: '#fef3c7', color: '#b45309', border: '1.5px solid #f59e0b', text: '🏝️' },
        visiting: { bg: '#dbeafe', color: '#1d4ed8', border: '2px solid #2563eb', text: '1' },
      };

      const base = stateStyles[state] || stateStyles.water;
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
  id: 'sub-islands',
  aliases: ['sub-islands', 'count-sub-islands', 'leetcode-1905', '1905'],
  name: '统计子岛屿 (Count Sub Islands)',
  category: 'graph',
  hasDeductionTree: true,
  description: '双网格反向剪枝排除法：若子网格陆地触犯母网格水域则整岛排除，剩下的岛屿全为合法子岛',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 23,
  learningGoal: '掌握双网格连通分量协同判定模型与反向剪枝剔除非法连通块的优雅技巧',
  inputs: [
    {
      id: 'preset',
      label: '测试用例选择',
      type: 'select',
      defaultValue: 'classic',
      options: [
        { label: PRESET_CASES.classic.label, value: 'classic' },
        { label: PRESET_CASES.example2.label, value: 'example2' },
      ],
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { preset: 'classic' } },
    { label: PRESET_CASES.example2.label, values: { preset: 'example2' } },
  ],
  metrics: [
    { id: 'metric-phase', label: '推演阶段', color: '#3b82f6' },
    { id: 'metric-scan', label: '当前访问格', color: '#fbbf24' },
    { id: 'metric-grid1-val', label: '母图状态', color: '#8b5cf6' },
    { id: 'metric-excluded-count', label: '排除非子岛', color: '#ef4444' },
    { id: 'metric-sub-island-count', label: '确认子岛总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#6366f1' },
  ],
  legend: [
    { label: '待定陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#93c5fd' },
    { label: '母图冲突点 (❌)', color: '#ef4444' },
    { label: '已排除非子岛 (🌊)', color: '#0284c7' },
    { label: '确认纯正子岛 (🏝️)', color: '#b45309' },
  ],
  codeLanguages: SUB_ISLANDS_CODE_LANGUAGES,
  problemHtml: SUB_ISLANDS_PROBLEM_HTML,
  analysisHtml: SUB_ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const key = inputs?.preset === 'example2' ? 'example2' : 'classic';
    const c = PRESET_CASES[key];
    return withSubIslandsMetrics(buildSubIslandsSteps(c.grid1, c.grid2));
  },
  renderCanvas: (container, step) => renderSubIslandsCanvas(container, step as SubIslandsStep),
});
