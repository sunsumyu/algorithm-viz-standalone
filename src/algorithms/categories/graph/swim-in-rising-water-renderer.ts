/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778) 声明式可视化器
 * 左程云《算法通关课》Class 064 Code03
 * 核心：网格图瓶颈最短路、max(dis, grid[nx][ny]) 松弛、Dijkstra 小根堆定向淹没
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  SWIM_IN_RISING_WATER_PROBLEM_HTML,
  SWIM_IN_RISING_WATER_ANALYSIS_HTML,
} from './swim-in-rising-water-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import type { SwimStep } from './swim-in-rising-water-step-compiler';
import {
  buildSwimInRisingWaterSteps,
} from './swim-in-rising-water-step-compiler';

export type { SwimStep };
export { buildSwimInRisingWaterSteps };

export function renderSwimInRisingWaterCanvas(container: HTMLElement, step: SwimStep): void {
  const { grid, r: curR, c: curC, distGrid, visitedGrid, curWaterLevel, bestPath } = step;
  const n = grid.length;
  const m = grid[0].length;
  const pathSet = new Set(bestPath?.map((p) => `${p.r},${p.c}`) ?? []);

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: n,
    cols: m,
    cellSize: '1fr',
    maxWidth: '520px',
    getCell: (r, c) => {
      const isCur = r === curR && c === curC;
      const isPath = pathSet.has(`${r},${c}`);
      const isVisited = visitedGrid[r][c];
      const isTarget = r === n - 1 && c === m - 1;
      const isStart = r === 0 && c === 0;
      const h = grid[r][c];
      const isSubmerged = curWaterLevel >= h;

      let bg = '#ffffff';
      let border = '1.5px solid #cbd5e1';
      let color = '#334155';

      if (isPath) {
        bg = '#ecfdf5';
        border = '2px solid #10b981';
        color = '#065f46';
      } else if (isVisited) {
        bg = '#e0f2fe';
        border = '1.5px solid #38bdf8';
        color = '#0369a1';
      } else if (isSubmerged) {
        bg = '#f1f5f9';
        border = '1.5px dashed #94a3b8';
        color = '#64748b';
      }

      const d = distGrid[r][c];
      return {
        text: `${h}m (t:${d === Infinity ? '∞' : d})`,
        bg,
        border: isCur ? '2px solid #f59e0b' : border,
        color,
        boxShadow: isCur ? '0 0 0 3px rgba(245, 158, 11, 0.35)' : 'none',
        transform: isCur ? 'scale(1.06)' : 'none',
        zIndex: isCur ? 10 : 1,
        title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}(${r},${c}) 高度:${h} 水位:${d === Infinity ? '∞' : d}`,
      };
    },
  });
}

const { template, Visualizer } = createDeclarativeVisualizer<SwimStep>({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  category: 'graph',
  hasDeductionTree: true,
  icon: '🏊',
  codeLanguages: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  problemHtml: SWIM_IN_RISING_WATER_PROBLEM_HTML,
  analysisHtml: SWIM_IN_RISING_WATER_ANALYSIS_HTML,
  generateSteps: (inputs) => buildSwimInRisingWaterSteps(String(inputs?.preset || 'leetcode5')),
  inputs: [
    {
      id: 'preset',
      label: '地形预设',
      type: 'select',
      defaultValue: 'leetcode5',
      options: [
        { label: '经典 5x5 (LeetCode 778)', value: 'leetcode5' },
        { label: '紧凑 3x3 地图', value: 'simple3' },
        { label: '险崖 4x4 地图', value: 'cliff4' },
      ],
    },
  ],
  metrics: [
    { id: 'metric-cur-time', label: '当前水位时间 t', color: '#0284c7' },
    { id: 'metric-cur-pos', label: '当前探索坐标', color: '#f59e0b' },
    { id: 'metric-pq-size', label: '堆候选数量', color: '#6366f1' },
    { id: 'metric-swim-phase', label: '算法演进阶段', color: '#10b981' },
  ],
  renderCanvas: (container, step) => renderSwimInRisingWaterCanvas(container, step),
});

registerAlgorithm({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  viewId: 'algo-swim-in-rising-water-view',
  icon: '🏊',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code03：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆 (LeetCode 778)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握网格图瓶颈最短路变型、带优先级的动态淹没模拟及二分+BFS/Dijkstra求解',
});

export { Visualizer as SwimInRisingWaterVisualizer };
