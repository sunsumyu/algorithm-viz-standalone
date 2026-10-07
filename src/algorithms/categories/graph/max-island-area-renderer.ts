/**
 * 岛屿的最大面积 (LC 695) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MAX_ISLAND_AREA_PROBLEM_HTML,
  MAX_ISLAND_AREA_ANALYSIS_HTML,
  MAX_ISLAND_AREA_CODE_LANGUAGES,
} from './max-island-area-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildMIASteps,
  withMIAMetrics,
  type MIAStep,
} from './max-island-area-step-compiler';

export { buildMIASteps, type MIAStep } from './max-island-area-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典 5 格大岛 [4×5]',
    grid: [
      [0, 0, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 0, 1, 1],
    ],
  },
  large: {
    label: '连片 15 格大岛 [4×5]',
    grid: [
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 0, 1],
      [0, 0, 0, 0, 0],
    ],
  },
  empty: {
    label: '全域水域 [3×3]',
    grid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  },
};

export function renderMaxIslandAreaCanvas(container: HTMLElement, step: MIAStep): void {
  const { states, current, scan } = step;
  const m = states.length;
  const n = states[0]?.length || 0;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: m,
    cols: n,
    getCell: (r, c) => {
      const state = states[r][c];
      const isCurr = current && current[0] === r && current[1] === c;
      const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;

      let bg = '#f1f5f9';
      let color = '#94a3b8';
      let border = '1.5px solid #cbd5e1';
      let transform = 'none';
      let boxShadow = 'none';

      if (state === 'water') {
        bg = '#eff6ff';
        color = '#93c5fd';
        border = '1.5px solid #dbeafe';
      } else if (state === 'land') {
        bg = '#ecfdf5';
        color = '#059669';
        border = '1.5px solid #a7f3d0';
      } else if (state === 'visited') {
        bg = '#f1f5f9';
        color = '#94a3b8';
        border = '1.5px solid #cbd5e1';
      }

      if (isScan) {
        bg = '#fef9c3';
        border = '1.5px solid #ca8a04';
        color = '#a16207';
        transform = 'scale(1.06)';
        boxShadow = '0 0 0 2px rgba(234, 179, 8, 0.35)';
      }
      if (isCurr) {
        bg = '#d1fae5';
        border = '1.5px solid #10b981';
        color = '#047857';
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.4)';
      }

      const text = state === 'water' ? '0' : state === 'land' ? '1' : '✓';
      return { text, bg, color, border, transform, boxShadow, zIndex: isCurr ? 3 : isScan ? 2 : 1 };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'max-island-area',
  aliases: ['class058-code02', 'max-area-of-island-695'],
  name: '岛屿的最大面积',
  category: 'graph',
  description: '使用深度优先搜索计算并返回网格中最大连通岛屿的面积',
  icon: '📐',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握 DFS 递归计数与全局极值维护的经典网格图解法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid),
      placeholder: '如 00100; 11100',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.large.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.large.grid) } },
    { label: PRESET_CASES.empty.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.empty.grid) } },
  ],
  metrics: [
    { id: 'metric-scan', label: '当前扫描格', color: '#3b82f6' },
    { id: 'metric-curr', label: '当前 DFS 坐标', color: '#fbbf24' },
    { id: 'metric-cur-area', label: '当前岛屿面积', color: '#059669' },
    { id: 'metric-max-area', label: '最大面积', color: '#10b981' },
    { id: 'action', label: '递归公式', color: '#6366f1' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#059669' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '递归累加中', color: '#10b981' },
    { label: '已沉没', state: 'unvisited' },
  ],
  codeLanguages: MAX_ISLAND_AREA_CODE_LANGUAGES,
  problemHtml: MAX_ISLAND_AREA_PROBLEM_HTML,
  analysisHtml: MAX_ISLAND_AREA_ANALYSIS_HTML,
  generateSteps: (inputs) => withMIAMetrics(buildMIASteps(parseBinaryGrid(inputs?.grid, PRESET_CASES.classic.grid))),
  renderCanvas: (container, step) => renderMaxIslandAreaCanvas(container, step as MIAStep),
});
