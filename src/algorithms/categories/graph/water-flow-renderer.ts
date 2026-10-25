/**
 * 太平洋大西洋水流 (LC 417) — 声明式 4-Card 标准架构
 * 逆向多源 DFS：双洋边界逆流登山搜索，求双洋可达性交集
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  WATER_FLOW_PROBLEM_HTML,
  WATER_FLOW_ANALYSIS_HTML,
  STAGE1_BRUTE_FORCE_CODES,
  STAGE2_DFS_CODES,
  STAGE3_BFS_CODES,
} from './water-flow-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { WFStep } from './water-flow-step-compiler';
import {
  DEFAULT_HEIGHTS,
  PRESET_CASES,
  buildWaterFlowSteps,
  createWaterFlowSteps,
  createWaterFlowStageSteps,
  formatHeightsInput,
  heightsToText,
  parseHeightsText,
} from './water-flow-step-compiler';

export type { WFStep };
export { DEFAULT_HEIGHTS, buildWaterFlowSteps, parseHeightsText, heightsToText, formatHeightsInput, createWaterFlowStageSteps };

export function renderWaterFlowCanvas(container: HTMLElement, step: WFStep): void {
  const { heights, rows, cols, pacReachable, atlReachable, currentCell, action } = step;
  const isDone = action === 'done', isIntersect = action === 'intersect';

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    variant: 'adventurer',
    showCoords: true,
    maxWidth: '560px',
    riverBarrierText: isDone
      ? `🎉 太平洋与大西洋搜索完成 · 共探明 ${step.bothCount} 处双洋交集枢纽！`
      : `🌊 边界多源逆流登山：西北太平洋 (P) ⇄ 东南大西洋 (A) 🏔️`,
    adventurer: currentCell ? {
      r: currentCell[0],
      c: currentCell[1],
      state: isDone ? 'cheering' : isIntersect ? 'jumping' : 'walking',
      isFinish: isDone,
      isHopping: true,
    } : null,
    getCell: (r, c) => {
      const h = heights[r][c], isPac = pacReachable[r][c], isAtl = atlReachable[r][c];
      const isBoth = isPac && isAtl, isCur = Boolean(currentCell && currentCell[0] === r && currentCell[1] === c);
      const bg = isBoth ? '#fdf4ff' : isPac ? '#eff6ff' : isAtl ? '#fef2f2' : '#ffffff';
      const border = isBoth ? '2px solid #a855f7' : isPac ? '1.5px solid #60a5fa' : isAtl ? '1.5px solid #f87171' : '1.5px solid #cbd5e1';
      const color = isBoth ? '#7e22ce' : isPac ? '#1d4ed8' : isAtl ? '#b91c1c' : '#334155';
      const oceanTag = isBoth ? 'P&A' : isPac ? 'P' : isAtl ? 'A' : '';
      return {
        text: `${h}${oceanTag ? ` (${oceanTag})` : ''}`,
        bg,
        border,
        color,
        fontWeight: isBoth ? '900' : '700',
        boxShadow: isCur ? '0 0 0 3px #facc15' : isBoth ? '0 0 0 2.5px rgba(168, 85, 247, 0.35)' : 'none',
        transform: isCur ? 'scale(1.08)' : 'none',
        zIndex: isCur ? 20 : 1,
      };
    },
  });
}

const COMMON_METRICS = [
  { id: 'metric-cur-cell', label: '当前访问格', color: '#eab308' },
  { id: 'metric-stage', label: '当前阶段', color: '#2563eb' },
  { id: 'metric-pac-count', label: '太平洋可达', color: '#3b82f6' },
  { id: 'metric-atl-count', label: '大西洋可达', color: '#dc2626' },
  { id: 'metric-both-count', label: '双洋交集', color: '#c084fc' },
  { id: 'action', label: '逆流判定', color: '#6366f1' },
];

registerDeclarativeAlgorithm({
  id: 'water-flow',
  aliases: ['class058-code04', 'pacific-atlantic-417'],
  name: '太平洋大西洋水流 (LC 417)',
  category: 'graph',
  description: '从正向暴力到逆向思维：双洋边界逆流登山 (DFS/BFS) 与双矩阵交集求解',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 17,
  hasDeductionTree: true,
  learningGoal: '深刻掌握正向顺流与逆向登山思维逆转，熟练对比 DFS 递归栈与 BFS 队列波前扩散',
  defaultStage: 'stage-2',
  inputs: [
    {
      id: 'heights',
      label: '高度矩阵 (每行以分号;分隔)',
      type: 'text',
      defaultValue: formatHeightsInput(DEFAULT_HEIGHTS),
      placeholder: '如 1 2 2 3 5; 3 2 3 4 4; 2 4 5 3 1',
      width: '260px',
    },
  ],
  presets: Object.values(PRESET_CASES).map((p) => ({ label: p.label, values: { heights: formatHeightsInput(p.heights) } })),
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 逐格正向顺流暴力 (Brute-force Forward)',
      shortName: '逐格暴力',
      num: 1,
      badge: { mode: '单源顺流正向模拟', complexity: 'O((MN)²) · O(MN)' },
      codeLanguages: STAGE1_BRUTE_FORCE_CODES,
      buildSteps: (inputs) => createWaterFlowStageSteps('stage-1', inputs?.heights as string),
      renderCanvas: (c, s) => renderWaterFlowCanvas(c, s as WFStep),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 边界多源逆流 DFS (Boundary Multi-source DFS)',
      shortName: '边界 DFS',
      num: 2,
      badge: { mode: '边界多源逆流 · 递归深搜', complexity: 'O(MN) · O(MN)' },
      codeLanguages: STAGE2_DFS_CODES,
      buildSteps: (inputs) => createWaterFlowStageSteps('stage-2', inputs?.heights as string),
      renderCanvas: (c, s) => renderWaterFlowCanvas(c, s as WFStep),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 边界多源扩散 BFS (Boundary Multi-source BFS)',
      shortName: '边界 BFS',
      num: 3,
      badge: { mode: '队列波前层序扩张 · 避免爆栈', complexity: 'O(MN) · O(MN)' },
      codeLanguages: STAGE3_BFS_CODES,
      buildSteps: (inputs) => createWaterFlowStageSteps('stage-3', inputs?.heights as string),
      renderCanvas: (c, s) => renderWaterFlowCanvas(c, s as WFStep),
    },
  ],
  metrics: COMMON_METRICS,
  legend: [
    { label: '太平洋可达 (P)', color: '#93c5fd' },
    { label: '大西洋可达 (A)', color: '#fca5a5' },
    { label: '双洋交集 (P & A)', color: '#c084fc' },
  ],
  codeLanguages: STAGE2_DFS_CODES,
  problemHtml: WATER_FLOW_PROBLEM_HTML,
  analysisHtml: WATER_FLOW_ANALYSIS_HTML,
  generateSteps: (inputs) => createWaterFlowSteps(inputs?.heights as string),
  renderCanvas: (container, step) => renderWaterFlowCanvas(container, step as WFStep),
});
