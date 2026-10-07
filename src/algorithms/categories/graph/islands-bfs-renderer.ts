/**
 * 岛屿数量 (BFS 广度优先搜索) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ISLANDS_BFS_PROBLEM_HTML,
  ISLANDS_BFS_ANALYSIS_HTML,
  ISLANDS_BFS_CODE_LANGUAGES,
} from './islands-bfs-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildIslandsBFSSteps,
  withIslandsBFSMetrics,
  type IslandsBFSStep,
} from './islands-bfs-step-compiler';

export { buildIslandsBFSSteps, type IslandsBFSStep } from './islands-bfs-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典 3 岛屿 [4×5]', grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]] },
  single: { label: '单座大岛 [4×4]', grid: [[1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]] },
  scattered: { label: '多散点 4 岛屿 [4×5]', grid: [[1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0]] },
};

export function renderIslandsBFSCanvas(container: HTMLElement, step: IslandsBFSStep): void {
  const { states, current, queue, scan } = step;
  const qSet = new Set(queue.map(([r, c]) => `${r},${c}`));

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: states.length,
    cols: states[0]?.length || 0,
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
  id: 'islands-bfs',
  name: '岛屿数量 (BFS)',
  category: 'graph',
  description: '使用广度优先搜索队列波浪式染色计算二维网格中连通岛屿的数量',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握网格图 BFS 逐层扩散与入队即染色的内存控制技巧',
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
    { id: 'metric-curr', label: '当前出队格', color: '#fbbf24' },
    { id: 'metric-queue-size', label: '队列长度', color: '#a855f7' },
    { id: 'metric-island-count', label: '岛屿总数', color: '#10b981' },
    { id: 'action', label: '队列内容', color: '#3b82f6' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '队列处理中', color: '#fbbf24' },
    { label: '沉没/已访问', state: 'unvisited' },
  ],
  codeLanguages: ISLANDS_BFS_CODE_LANGUAGES,
  problemHtml: ISLANDS_BFS_PROBLEM_HTML,
  analysisHtml: ISLANDS_BFS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withIslandsBFSMetrics(buildIslandsBFSSteps(parseBinaryGrid(inputs?.grid, PRESET_CASES.classic.grid))),
  renderCanvas: (container, step) => renderIslandsBFSCanvas(container, step as IslandsBFSStep),
});
