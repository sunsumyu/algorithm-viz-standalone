/**
 * 岛屿数量 (DFS 深度优先搜索) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ISLANDS_PROBLEM_HTML,
  ISLANDS_ANALYSIS_HTML,
  ISLANDS_CODE_LANGUAGES,
} from './islands-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildIslandsSteps,
  withIslandsMetrics,
  type IslandsStep,
  type CellState,
} from './islands-step-compiler';

export { buildIslandsSteps, type IslandsStep, type CellState } from './islands-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典 3 岛屿 [4×5]', grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]] },
  single: { label: '单座大岛 [4×4]', grid: [[1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]] },
  scattered: { label: '多散点 4 岛屿 [4×5]', grid: [[1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0]] },
};

export function renderIslandsCanvas(container: HTMLElement, step: IslandsStep): void {
  const { states, current, scan } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: states.length,
    cols: states[0]?.length || 0,
    getCell: (r, c) => {
      const state = states[r][c];
      const isCurr = current && current[0] === r && current[1] === c;
      const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;

      const stateStyles: Record<string, { bg: string; color: string; border: string }> = {
        water: { bg: '#eff6ff', color: '#93c5fd', border: '1.5px solid #dbeafe' },
        land: { bg: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac' },
        visited: { bg: '#f1f5f9', color: '#94a3b8', border: '1.5px solid #e2e8f0' },
      };
      const base = stateStyles[state] || { bg: '#f1f5f9', color: '#64748b', border: '1.5px solid #cbd5e1' };
      const highlight = isCurr
        ? { bg: '#dbeafe', border: '1.5px solid #2563eb', color: '#1d4ed8', transform: 'scale(1.08)', boxShadow: '0 0 0 3px rgba(37,99,235,0.4)', zIndex: 3 }
        : isScan
          ? { bg: '#fef9c3', border: '1.5px solid #ca8a04', color: '#a16207', transform: 'scale(1.06)', boxShadow: '0 0 0 2px rgba(234,179,8,0.35)', zIndex: 2 }
          : { ...base, transform: 'none', boxShadow: 'none', zIndex: 1 };

      const text = state === 'water' ? '0' : state === 'land' ? '1' : '✓';
      return { text, ...base, ...highlight };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'islands',
  aliases: ['class029-code01', 'islands', 'number-of-islands', 'leetcode-200'],
  name: '岛屿数量 (DFS)',
  category: 'graph',
  description: '使用深度优先搜索沉岛法计算二维网格中连通岛屿的数量',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握网格图 DFS 连通分量遍历与沉岛染色技巧',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid),
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
    { id: 'metric-scan', label: '扫描位置', color: '#3b82f6' },
    { id: 'metric-curr', label: '当前 DFS 格', color: '#fbbf24' },
    { id: 'metric-visited-land', label: '已访问陆地', color: '#a855f7' },
    { id: 'island-count', label: '岛屿总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#16a34a' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '访问中', color: '#fbbf24' },
    { label: '沉没/已访问', state: 'unvisited' },
  ],
  codeLanguages: ISLANDS_CODE_LANGUAGES,
  problemHtml: ISLANDS_PROBLEM_HTML,
  analysisHtml: ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withIslandsMetrics(buildIslandsSteps(parseBinaryGrid(inputs?.grid, PRESET_CASES.classic.grid))),
  renderCanvas: (container, step) => renderIslandsCanvas(container, step as IslandsStep),
});
