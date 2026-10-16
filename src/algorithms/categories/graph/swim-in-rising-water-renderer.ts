/**
 * 水位上升的泳池中游泳 (Swim in Rising Water - LeetCode 778) 声明式可视化器
 * 核心：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  SWIM_IN_RISING_WATER_PROBLEM_HTML,
  SWIM_IN_RISING_WATER_ANALYSIS_HTML,
} from './swim-in-rising-water-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { SwimStep } from './swim-in-rising-water-step-compiler';
import { buildSwimInRisingWaterSteps } from './swim-in-rising-water-step-compiler';

export type { SwimStep };
export { buildSwimInRisingWaterSteps };

export function renderSwimInRisingWaterCanvas(container: HTMLElement, step: SwimStep): void {
  const { grid, r: curR, c: curC, distGrid, visitedGrid, curWaterLevel, bestPath } = step;
  const n = grid.length;
  const m = grid[0].length;
  const isDone = step.status === 'done';
  const pathSet = new Set(bestPath?.map((p) => `${p.r},${p.c}`) ?? []);

  const flowArrows: Array<{ from: [number, number]; to: [number, number]; color?: string; dashed?: boolean; animated?: boolean }> = [];
  if (bestPath && bestPath.length > 1) {
    for (let i = 0; i < bestPath.length - 1; i++) {
      flowArrows.push({
        from: [bestPath[i].r, bestPath[i].c],
        to: [bestPath[i + 1].r, bestPath[i + 1].c],
        color: isDone ? '#10b981' : '#0284c7',
        dashed: true,
        animated: true,
      });
    }
  }

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: n,
    cols: m,
    variant: 'adventurer',
    showCoords: true,
    targetPos: [n - 1, m - 1],
    riverBarrierText: isDone
      ? `🏆 全程耗时: 第 ${curWaterLevel} 秒水位全线漫平 · 达成终点游泳连通 ✨`
      : `🌊 泳池水位演进: 当前第 ${curWaterLevel} 秒水位 (t = ${curWaterLevel}) · 水深已漫平 ≤ ${curWaterLevel}m 的平台 🏊`,
    flowArrows,
    adventurer: {
      r: curR,
      c: curC,
      state: isDone ? 'cheering' : 'walking',
      isFinish: isDone,
      isHopping: step.status === 'pop',
    },
    getCell: (r, c) => {
      const isCur = r === curR && c === curC;
      const isPath = pathSet.has(`${r},${c}`);
      const isStart = r === 0 && c === 0;
      const isTarget = r === n - 1 && c === m - 1;
      const h = grid[r][c];
      const isSubmerged = curWaterLevel >= h;
      const isVis = visitedGrid?.[r]?.[c];
      const d = distGrid?.[r]?.[c] ?? Infinity;

      let bg = '#ffffff';
      let border = '1px solid #cbd5e1';
      let color = '#334155';

      if (isCur) {
        bg = '#fef3c7';
        border = '2px solid #f59e0b';
        color = '#b45309';
      } else if (isPath && isDone) {
        bg = '#ecfdf5';
        border = '2px solid #10b981';
        color = '#065f46';
      } else if (isVis) {
        bg = '#e0f2fe';
        border = '1.5px solid #38bdf8';
        color = '#0284c7';
      } else if (isSubmerged) {
        bg = '#f0f9ff';
        border = '1px dashed #7dd3fc';
        color = '#0369a1';
      }

      let waterFloodHtml = '';
      if (isSubmerged) {
        const fillPercent = 100;
        const waterGrad = isPath && isDone
          ? 'linear-gradient(180deg, rgba(52,211,153,0.35) 0%, rgba(16,185,129,0.5) 100%)'
          : isCur
            ? 'linear-gradient(180deg, rgba(251,191,36,0.38) 0%, rgba(245,158,11,0.52) 100%)'
            : 'linear-gradient(180deg, rgba(56,189,248,0.3) 0%, rgba(2,132,199,0.45) 100%)';
        const waveStroke = isPath && isDone ? '#a7f3d0' : isCur ? '#fde68a' : '#bae6fd';
        const borderTopColor = isPath && isDone ? '#10b981' : isCur ? '#f59e0b' : '#38bdf8';
        waterFloodHtml = `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: ${fillPercent}%; background: ${waterGrad}; border-top: 1.5px solid ${borderTopColor}; transition: height 0.3s ease; border-radius: 0 0 10px 10px; pointer-events: none; overflow: hidden; z-index: 2;"><svg class="dp-river-waves-1" style="position: absolute; top: -3px; left: 0; width: 200%; height: 6px; opacity: 0.9;" preserveAspectRatio="none"><path d="M 0 3 Q 15 0, 30 3 T 60 3 T 90 3 T 120 3 T 150 3 T 180 3" fill="none" stroke="${waveStroke}" stroke-width="1.3" /></svg></div>`;
      }

      const effLabel = d !== Infinity
        ? `<div style="font-size: 8.5px; font-weight: 700; color: #0369a1; background: rgba(255, 255, 255, 0.92); padding: 1.5px 5px; border-radius: 4px; border: 1px solid rgba(125, 211, 252, 0.5); box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); white-space: nowrap; pointer-events: none; z-index: 5;">${d === 0 ? '⏱️ 0s 起点' : `⏱️ 第 ${d} 秒漫平`}</div>`
        : '';

      return {
        text: `${h}m`,
        extraHtml: `${waterFloodHtml}${effLabel}`,
        bg,
        border: isCur ? '2px solid #f59e0b' : border,
        color,
        boxShadow: isCur ? '0 0 0 3px rgba(245, 158, 11, 0.35)' : 'none',
        transform: isCur ? 'scale(1.06)' : 'none',
        zIndex: isCur ? 20 : isPath ? 10 : 1,
        title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}(${r},${c}) 高度:${h} 水位:${d === Infinity ? '∞' : d}`,
      };
    },
  });
}

export const { Visualizer: SwimInRisingWaterVisualizer } = registerDeclarativeAlgorithm<SwimStep>({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  aliases: ['swim-in-rising-water-064', 'class064-code03', 'leetcode-778'],
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code03：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆 (LeetCode 778)',
  icon: '🏊',
  difficulty: 3,
  levelOrder: 76,
  hasDeductionTree: true,
  learningGoal: '掌握网格图瓶颈最短路变型、带优先级的动态淹没模拟及二分+BFS/Dijkstra求解',
  codeLanguages: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  problemHtml: SWIM_IN_RISING_WATER_PROBLEM_HTML,
  analysisHtml: SWIM_IN_RISING_WATER_ANALYSIS_HTML,
  generateSteps: (inputs) => buildSwimInRisingWaterSteps(String(inputs?.preset || 'leetcode5')),
  presets: [
    { label: '经典 5x5 (LeetCode 778)', values: { preset: 'leetcode5' } },
    { label: '紧凑 3x3 地图', values: { preset: 'simple3' } },
    { label: '险崖 4x4 地图', values: { preset: 'cliff4' } },
  ],
  metrics: [
    { id: 'metric-cur-time', label: '当前水位时间 t', color: '#0284c7' },
    { id: 'metric-cur-pos', label: '当前探索坐标', color: '#f59e0b' },
    { id: 'metric-pq-size', label: '堆候选数量', color: '#6366f1' },
    { id: 'metric-swim-phase', label: '算法演进阶段', color: '#10b981' },
  ],
  renderCanvas: (container, step) => renderSwimInRisingWaterCanvas(container, step),
});
