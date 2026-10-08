/**
 * 太平洋大西洋水流 (LC 417) — 声明式 4-Card 标准架构
 * 逆向多源 DFS：双洋边界逆流登山搜索，求双洋可达性交集
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  WATER_FLOW_PROBLEM_HTML,
  WATER_FLOW_ANALYSIS_HTML,
  WATER_FLOW_CODE_LANGUAGES,
} from './water-flow-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { WFStep } from './water-flow-step-compiler';
import {
  DEFAULT_HEIGHTS,
  PRESET_CASES,
  buildWaterFlowSteps,
  createWaterFlowSteps,
  heightsToText,
  parseHeightsText,
} from './water-flow-step-compiler';

export type { WFStep };
export { DEFAULT_HEIGHTS, buildWaterFlowSteps, parseHeightsText, heightsToText };

export function renderWaterFlowCanvas(container: HTMLElement, step: WFStep): void {
  const { heights, rows, cols, pacReachable, atlReachable, currentCell } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '620px',
    getCell: (r, c) => {
      const h = heights[r][c];
      const isPac = pacReachable[r][c];
      const isAtl = atlReachable[r][c];
      const isBoth = isPac && isAtl;
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

      let bg = '#ffffff';
      let border = '1px solid #cbd5e1';
      let color = '#334155';
      let fontWeight = '700';
      let boxShadow = 'none';

      if (isBoth) {
        bg = '#fdf4ff';
        border = '2px solid #c084fc';
        color = '#7e22ce';
        fontWeight = '900';
        boxShadow = '0 2px 6px rgba(192, 132, 252, 0.25)';
      } else if (isPac) {
        bg = '#eff6ff';
        border = '1.5px solid #93c5fd';
        color = '#1d4ed8';
      } else if (isAtl) {
        bg = '#fef2f2';
        border = '1.5px solid #fca5a5';
        color = '#b91c1c';
      }

      const oceanTag = isBoth ? 'P&A' : isPac ? 'P' : isAtl ? 'A' : '';
      return {
        text: `${h}${oceanTag ? ` (${oceanTag})` : ''}`,
        bg,
        border,
        color,
        fontWeight,
        boxShadow: isCurrent ? '0 0 0 3px #facc15' : boxShadow,
        transform: isCurrent ? 'scale(1.06)' : 'none',
        zIndex: isCurrent ? 10 : 1,
      };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'water-flow',
  aliases: ['class058-code04', 'pacific-atlantic-417'],
  name: '太平洋大西洋水流 (LC 417)',
  category: 'graph',
  description: '逆向思维：分别从太平洋与大西洋边界逆流登山搜索，求双洋可达性交集',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 17,
  hasDeductionTree: true,
  learningGoal: '掌握逆向多源 DFS/BFS 搜索与双矩阵交集求解技巧',
  inputs: [
    {
      id: 'heights',
      label: '高度矩阵 (每行空格分隔)',
      type: 'text',
      defaultValue: heightsToText(DEFAULT_HEIGHTS),
      placeholder: '每行如 1 2 2 3 5',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { heights: heightsToText(PRESET_CASES.classic.heights) } },
    { label: PRESET_CASES.valley.label, values: { heights: heightsToText(PRESET_CASES.valley.heights) } },
    { label: PRESET_CASES.slope.label, values: { heights: heightsToText(PRESET_CASES.slope.heights) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前访问格', color: '#eab308' },
    { id: 'metric-stage', label: '当前阶段', color: '#2563eb' },
    { id: 'metric-pac-count', label: '太平洋可达', color: '#3b82f6' },
    { id: 'metric-atl-count', label: '大西洋可达', color: '#dc2626' },
    { id: 'metric-both-count', label: '双洋交集', color: '#c084fc' },
    { id: 'action', label: '逆流判定', color: '#6366f1' },
  ],
  legend: [
    { label: '太平洋可达 (P)', color: '#93c5fd' },
    { label: '大西洋可达 (A)', color: '#fca5a5' },
    { label: '双洋交集 (P & A)', color: '#c084fc' },
  ],
  codeLanguages: WATER_FLOW_CODE_LANGUAGES,
  problemHtml: WATER_FLOW_PROBLEM_HTML,
  analysisHtml: WATER_FLOW_ANALYSIS_HTML,
  generateSteps: (inputs) => createWaterFlowSteps(inputs?.heights as string),
  renderCanvas: (container, step) => renderWaterFlowCanvas(container, step as WFStep),
});
