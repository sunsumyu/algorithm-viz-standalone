/**
 * 岛屿数量 (Number of Islands · LeetCode 200) 可视化器
 * Thin Domain Adapter — 严格遵循 LOC < 150 行身材红线与零内联 DOM 规范
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ISLANDS_PROBLEM_HTML,
  ISLANDS_ANALYSIS_HTML,
  STAGE1_DFS_CODES,
  STAGE2_BFS_CODES,
  STAGE3_UF_CODES,
} from './islands-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  createIslandsStageSteps,
  buildIslandsSteps,
  buildIslandsBFSSteps,
  PRESET_CASES,
  type IslandsStep,
  type CellState,
} from './islands-step-compiler';

export { buildIslandsSteps, buildIslandsBFSSteps, type IslandsStep, type CellState };

export function renderIslandsCanvas(container: HTMLElement, step: IslandsStep): void {
  const { states, current, scan, queue = [] } = step;
  const qSet = new Set(queue.map(([r, c]) => `${r},${c}`));

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: states.length,
    cols: states[0]?.length || 0,
    variant: 'adventurer',
    showCoords: true,
    adventurer: step.adventurer ? {
      r: step.adventurer.r,
      c: step.adventurer.c,
      state: step.adventurer.state === 'success' ? 'cheering' : step.adventurer.state === 'swimming' ? 'jumping' : 'walking',
      isHopping: step.adventurer.isHopping,
      isFinish: step.adventurer.isFinish,
    } : null,
    getCell: (r, c) => {
      const state = states[r][c];
      const isCurr = current && current[0] === r && current[1] === c;
      const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;
      const inQueue = qSet.has(`${r},${c}`);

      const stateStyles: Record<string, { bg: string; color: string; border: string }> = {
        water: { bg: '#eff6ff', color: '#93c5fd', border: '1.5px solid #dbeafe' },
        land: { bg: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac' },
        visited: { bg: '#f1f5f9', color: '#94a3b8', border: '1.5px solid #e2e8f0' },
      };
      const base = stateStyles[state] || { bg: '#f1f5f9', color: '#64748b', border: '1.5px solid #cbd5e1' };
      const highlight = isCurr
        ? { bg: '#dbeafe', border: '1.5px solid #2563eb', color: '#1d4ed8', transform: 'scale(1.08)', boxShadow: '0 0 0 3px rgba(37,99,235,0.4)', zIndex: 3 }
        : isScan || inQueue
          ? { bg: '#fef9c3', border: '1.5px solid #ca8a04', color: '#a16207', transform: 'scale(1.06)', boxShadow: '0 0 0 2px rgba(234,179,8,0.35)', zIndex: 2 }
          : { ...base, transform: 'none', boxShadow: 'none', zIndex: 1 };

      const text = state === 'water' ? '0' : state === 'land' ? '1' : '✓';
      return { text, ...base, ...highlight };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'islands',
  aliases: ['class029-code01', 'islands', 'number-of-islands', 'leetcode-200', 'islands-bfs', 'number-of-islands-bfs', 'leetcode-200-bfs'],
  name: '岛屿数量 (LC 200 全阶段演化)',
  category: 'graph',
  hasDeductionTree: true,
  description: '从 DFS 递归沉岛到 BFS 队列波浪扩散，再到并查集 Union-Find 连通分量的完整演化',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握网格图连通块分析三大经典解法：DFS、BFS 与并查集',
  defaultStage: 'stage-1',
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
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 深度优先 DFS 沉岛法 (DFS Sinking)',
      shortName: 'DFS 沉岛',
      num: 1,
      badge: { mode: '递归四向连通分量遍历', complexity: 'O(MN) · O(MN)' },
      codeLanguages: STAGE1_DFS_CODES,
      buildSteps: (inputs) => createIslandsStageSteps('stage-1', parseBinaryGrid(inputs?.grid as string, PRESET_CASES.classic.grid)),
      renderCanvas: (c, s) => renderIslandsCanvas(c, s as IslandsStep),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 广度优先 BFS 队列波浪扩散 (BFS Wavefront)',
      shortName: 'BFS 队列',
      num: 2,
      badge: { mode: '入队即染色 · 避免内存暴涨', complexity: 'O(MN) · O(min(M, N))' },
      codeLanguages: STAGE2_BFS_CODES,
      buildSteps: (inputs) => createIslandsStageSteps('stage-2', parseBinaryGrid(inputs?.grid as string, PRESET_CASES.classic.grid)),
      renderCanvas: (c, s) => renderIslandsCanvas(c, s as IslandsStep),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 并查集连通分量合并 (Union-Find)',
      shortName: '并查集',
      num: 3,
      badge: { mode: '动态集合合并 · 统计独立分量', complexity: 'O(MN·α(MN)) · O(MN)' },
      codeLanguages: STAGE3_UF_CODES,
      buildSteps: (inputs) => createIslandsStageSteps('stage-3', parseBinaryGrid(inputs?.grid as string, PRESET_CASES.classic.grid)),
      renderCanvas: (c, s) => renderIslandsCanvas(c, s as IslandsStep),
    },
  ],
  metrics: [
    { id: 'metric-scan', label: '扫描/探测位置', color: '#3b82f6' },
    { id: 'metric-curr', label: '探险家立足格', color: '#fbbf24' },
    { id: 'metric-queue-size', label: '队列长度', color: '#a855f7' },
    { id: 'metric-island-count', label: '岛屿总数', color: '#10b981' },
    { id: 'action', label: '当前决策', color: '#16a34a' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '探测/波前', color: '#fbbf24' },
    { label: '沉没/已访问', state: 'unvisited' },
  ],
  codeLanguages: STAGE1_DFS_CODES,
  problemHtml: ISLANDS_PROBLEM_HTML,
  analysisHtml: ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    createIslandsStageSteps('stage-1', parseBinaryGrid(inputs?.grid as string, PRESET_CASES.classic.grid)),
  renderCanvas: (container, step) => renderIslandsCanvas(container, step as IslandsStep),
});
