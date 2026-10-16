/**
 * 二维接雨水 II (Trapping Rain Water II - LeetCode 407)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/graph-062/trapping-rain-water-ii-062-renderer
 * 本文件保留 Visualizer 类与步骤生成器供已有单测使用，注销重复 catalog 注册
 */

import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TRAPPING_WATER_II_CODE_LANGUAGES,
  TRAPPING_WATER_II_PROBLEM_HTML,
  TRAPPING_WATER_II_ANALYSIS_HTML,
} from './trapping-water-ii-problem-content';
import {
  buildTrappingWaterIISteps,
  type Trap2Step,
} from './trapping-water-ii-step-compiler';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';

export type { Trap2Step };
export { buildTrappingWaterIISteps };

export function renderTrappingWaterIICanvas(container: HTMLElement, step: Trap2Step): void {
  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: step.grid.length,
    cols: step.grid[0].length,
    getCell: (r, c) => {
      const isCur = step.curR === r && step.curC === c && step.status !== 'done';
      const h = step.grid[r][c];
      const wLevel = step.waterLevel[r][c];
      const trapped = wLevel - h;
      const isVis = step.visited[r][c];

      let text = `⛰️${h}`;
      let subtext = `(${r},${c})`;
      let bg = '#0f172a';
      let border = '1px solid #475569';
      let boxShadow = 'none';

      if (trapped > 0) {
        bg = '#0284c7';
        border = '2px solid #38bdf8';
        text = `💧${wLevel}`;
        subtext = `+${trapped}`;
        boxShadow = '0 0 8px rgba(56, 189, 248, 0.4)';
      } else if (isVis) {
        bg = '#1e293b';
        border = '1px solid #10b981';
      }

      if (isCur) {
        bg = '#b45309';
        border = '2px solid #facc15';
        boxShadow = '0 0 10px rgba(250, 204, 21, 0.5)';
        text = `🪵${h}`;
      }

      return {
        text,
        subtext,
        bg,
        border,
        boxShadow,
        color: '#ffffff',
        transform: isCur ? 'scale(1.06)' : 'none',
        fontWeight: '800',
        zIndex: isCur ? 10 : 1,
      };
    },
  });
}

const { template, Visualizer } = createDeclarativeVisualizer<Trap2Step>({
  id: 'trapping-water-ii',
  name: '二维接雨水 II (Trapping Rain Water II)',
  category: 'graph',
  icon: '🌊',
  hasDeductionTree: true,
  card1Title: '🌊 3D 网格地形、木桶短板与水面蔓延沙盘',
  card2Title: '📊 水位状态监视器 (waterLevel, visited, 小根堆)',
  card2Desc: '逐行对齐四周边界入堆、木桶最短板出堆、低洼格蓄水 ans += w - h 与水线推移',
  presets: [
    { label: '3x6 经典地形', values: { 'input-preset': 'classic_3x6' } },
    { label: '3x3 中心洼地', values: { 'input-preset': 'simple_3x3' } },
  ],
  metrics: [
    { id: 'metric-trap2-total', label: '累计总蓄水量', color: '#38bdf8' },
    { id: 'metric-trap2-board', label: '当前木桶最短板', color: '#f59e0b' },
    { id: 'metric-trap2-heap', label: '堆内边界板数量', color: '#10b981' },
    { id: 'metric-trap2-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TRAPPING_WATER_II_CODE_LANGUAGES,
  problemHtml: TRAPPING_WATER_II_PROBLEM_HTML,
  analysisHtml: TRAPPING_WATER_II_ANALYSIS_HTML,
  buildSteps: (inputs) => buildTrappingWaterIISteps(String(inputs?.['input-preset'] || 'classic_3x6')),
  renderCanvas: renderTrappingWaterIICanvas,
});

export { Visualizer as TrappingWaterIIVisualizer };
