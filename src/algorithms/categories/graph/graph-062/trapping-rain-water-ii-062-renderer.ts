/**
 * 左程云算法通关课 Class 062: 二维接雨水 II (Trapping Rain Water II · LeetCode 407)
 * 小根堆优先队列 + 木桶短板效应向内收缩 — 声明式 Thin Domain Adapter (LOC < 140)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { TRAPPING_RAIN_WATER_II_062_CODES } from './graph-062-stage-codes';
import { renderDequeVisualization } from './graph-062-shared';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildTrappingWaterII062Steps,
  type Trap2Step,
} from './trapping-rain-water-ii-062-step-compiler';

export { buildTrappingWaterII062Steps, buildTrappingWaterII062Steps as buildTrappingWaterIISteps, type Trap2Step };

export function renderTrappingRainWaterIICanvas(container: HTMLElement, step: Trap2Step): void {
  const m = step.grid.length;
  const n = step.grid[0].length;

  container.innerHTML = '<div class="trw-grid-box" style="width:100%; display:flex; justify-content:center;"></div><div class="trw-heap-box" style="width:100%;"></div>';
  const gridBox = container.querySelector('.trw-grid-box') as HTMLElement;
  const heapBox = container.querySelector('.trw-heap-box') as HTMLElement;

  BinaryGridCanvasAdapter.renderGridCanvas(gridBox, {
    rows: m,
    cols: n,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '440px',
    getCell: (r, c) => {
      const isCur = step.curR === r && step.curC === c;
      const h = step.grid[r][c];
      const trapped = step.waterLevel[r][c] - h;

      let bg = '#ffffff';
      let color = '#334155';
      let border = '1.5px solid #cbd5e1';
      let text = `⛰️${h}`;
      let boxShadow = 'none';
      let transform = 'none';

      if (trapped > 0) {
        bg = '#bae6fd';
        color = '#0369a1';
        border = '1.5px solid #38bdf8';
        text = `💧+${trapped}`;
      } else if (step.visited[r][c]) {
        bg = '#f1f5f9';
        color = '#64748b';
        border = '1.5px solid #94a3b8';
      }

      if (isCur) {
        bg = '#fef3c7';
        border = '2px solid #f59e0b';
        boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.25)';
        transform = 'scale(1.08)';
      }

      return {
        text,
        bg,
        color,
        border,
        boxShadow,
        transform,
        zIndex: isCur ? 10 : 1,
        fontSize: '12px',
        fontWeight: '800',
      };
    },
  });

  const heapItems = step.heapList.slice(0, 8).map((h, idx) => ({
    label: `(${h.r},${h.c})`,
    tag: `高:${h.w}`,
    isFront: idx === 0,
  }));

  heapBox.innerHTML = renderDequeVisualization(heapItems, '小根堆 (堆顶优先弹出最短木桶板)');
}

export const trappingRainWaterII062Visualizer = registerDeclarativeAlgorithm<Trap2Step>({
  id: 'trapping-rain-water-ii-062',
  aliases: [
    'trapping-water-ii',
    'trapping-rain-water-ii',
    'trap-rain-water-407',
    'trapping-rain-water-ii-class062',
    'trap-rain-water-407-062',
  ],
  name: '二维接雨水 II 与木桶原理 (Class 062)',
  category: 'graph',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 6205,
  learningGoal: '深刻理解小根堆优先队列模拟木桶短板收缩算法，水面高度只增不减的外围向内单调性证明',
  problemHtml: GRAPH_062_PROBLEMS.trappingRainWaterII062.html,
  codeLanguages: TRAPPING_RAIN_WATER_II_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '地形用例选择',
      type: 'select',
      defaultValue: 'classic_3x6',
      options: [
        { label: '3x6 经典地形 (总积水量 4)', value: 'classic_3x6' },
        { label: '3x3 中心凹陷盆地 (总积水量 2)', value: 'simple_3x3' },
      ],
    },
  ],
  presets: [
    { label: '3x6 经典凹陷盆地 (积水 4)', values: { preset: 'classic_3x6' } },
    { label: '3x3 单心凹陷低洼 (积水 2)', values: { preset: 'simple_3x3' } },
  ],
  generateSteps: (inputs) => buildTrappingWaterII062Steps(inputs?.preset),
  renderCanvas: (container, step) => renderTrappingRainWaterIICanvas(container, step),
});
