/**
 * 二维接雨水 II (Trapping Rain Water II - LeetCode 407 / 左程云 Class 064 题目1) 声明式可视化器
 * 核心：外围木桶最短板出堆、大根水面蔓延 max(water, height)、小根堆木桶效应
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TRAPPING_WATER_II_CODE_LANGUAGES,
  TRAPPING_WATER_II_PROBLEM_HTML,
  TRAPPING_WATER_II_ANALYSIS_HTML,
} from './trapping-water-ii-problem-content';

export interface Trap2Step {
  grid: number[][];
  waterLevel: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  totalWater: number;
  status: 'init_border' | 'spread' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTrappingWaterIISteps(): Trap2Step[] {
  const steps: Trap2Step[] = [];

  const grid = [
    [1, 4, 3, 1, 3, 2],
    [3, 2, 1, 3, 2, 4],
    [2, 3, 3, 2, 3, 1],
  ];

  steps.push({
    grid,
    waterLevel: [
      [1, 4, 3, 1, 3, 2],
      [3, 0, 0, 0, 0, 4],
      [2, 3, 3, 2, 3, 1],
    ],
    visited: [
      [true, true, true, true, true, true],
      [true, false, false, false, false, true],
      [true, true, true, true, true, true],
    ],
    curR: 0,
    curC: 0,
    totalWater: 0,
    status: 'init_border',
    message: '1. [外围木桶边界入小根堆] 矩阵最外圈的所有节点作为木桶外壁压入优先队列小根堆！',
    log: '外围边框入堆：最短板高度 = 1',
    codeLine: [18, 25],
  });

  steps.push({
    grid,
    waterLevel: [
      [1, 4, 3, 1, 3, 2],
      [3, 3, 3, 3, 3, 4],
      [2, 3, 3, 2, 3, 1],
    ],
    visited: [
      [true, true, true, true, true, true],
      [true, true, true, true, true, true],
      [true, true, true, true, true, true],
    ],
    curR: 1,
    curC: 2,
    totalWater: 4,
    status: 'spread',
    message: '2. [最短板向内扩散灌水] 弹出外壁最低点，遇到内部低洼地 (1, 2, h:1)，当前水面高度为 3，蓄水 3 - 1 = 2！',
    log: '向内蔓延灌水：(1, 2) 蓄水 +2, (1, 1) 蓄水 +1, (1, 4) 蓄水 +1',
    codeLine: [28, 38],
  });

  steps.push({
    grid,
    waterLevel: [
      [1, 4, 3, 1, 3, 2],
      [3, 3, 3, 3, 3, 4],
      [2, 3, 3, 2, 3, 1],
    ],
    visited: [
      [true, true, true, true, true, true],
      [true, true, true, true, true, true],
      [true, true, true, true, true, true],
    ],
    curR: 1,
    curC: 2,
    totalWater: 4,
    status: 'done',
    message: '🎉 [接雨水 II 求解完成] 小根堆全部处理完毕，全图最大蓄水量 = 4！',
    log: '✓ 接雨水 II 模拟完毕：累计蓄水 = 4',
    codeLine: [40, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<Trap2Step>({
  id: 'trapping-water-ii',
  name: '接雨水 II (Trapping Rain Water II)',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: '小根堆木桶效应由外向内蔓延',
    complexity: 'O(R · C · log(R · C)) · O(R · C)',
  },
  card1Title: '🌊 3D 网格地形与水面灌水沙盘',
  card2Title: '🧭 蓄水容量与木桶最短板监视器',
  card2Desc: '外围边框木桶、小根堆贪心弹出最短板与水面蔓延 max(water, h)',
  legend: [
    { label: '外围木桶外壁', color: '#475569' },
    { label: '⚡ 当前最短板出堆', color: '#f59e0b' },
    { label: '🟢 成功蓄水低洼网格', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3x6 经典山谷地形 (LeetCode 407)', values: {} },
  ],
  metrics: [
    { id: 'metric-trap2-total', label: '累计接雨水量', color: '#10b981' },
    { id: 'metric-trap2-board', label: '当前木桶最短板', color: '#2563eb' },
  ],
  codeLanguages: TRAPPING_WATER_II_CODE_LANGUAGES,
  problemHtml: TRAPPING_WATER_II_PROBLEM_HTML,
  analysisHtml: TRAPPING_WATER_II_ANALYSIS_HTML,
  buildSteps: () => buildTrappingWaterIISteps(),
  renderCanvas: (container, step) => {
    const rows = step.grid
      .map((row, r) => {
        const cells = row
          .map((h, c) => {
            const isBorder = r === 0 || r === step.grid.length - 1 || c === 0 || c === row.length - 1;
            const w = step.waterLevel[r][c];
            const trapped = Math.max(0, w - h);
            const isCur = step.curR === r && step.curC === c;
            const bg = isCur ? '#b45309' : trapped > 0 ? '#065f46' : isBorder ? '#334155' : '#1e293b';
            const border = isCur ? '#facc15' : trapped > 0 ? '#10b981' : '#475569';

            return `
              <div style="width: 42px; height: 42px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; font-family: monospace;">
                <span style="font-size: 11.5px; font-weight: 800;">${h}</span>
                ${trapped > 0 ? `<span style="font-size: 8px; color: #34d399;">+${trapped}水</span>` : ''}
              </div>
            `;
          })
          .join('');
        return `<div style="display: flex; gap: 6px;">${cells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
          ${rows}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色单元格为蓄水坑洼 | 木桶原理：一个格子的蓄水高度由环绕它的最矮木板决定
        </div>
      </div>
    `;

    const root = container.closest('#algo-trapping-water-ii-view');
    if (root) {
      const tEl = root.querySelector('#metric-trap2-total');
      const bEl = root.querySelector('#metric-trap2-board');

      if (tEl) tEl.textContent = `${step.totalWater} 单位`;
      if (bEl) bEl.textContent = 'h = 3';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 2D 接雨水木桶转移方程:</span>
              <strong style="font-family: monospace; color: #2563eb;">water[nr][nc] = max(water[r][c], height[nr][nc])</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'trapping-water-ii',
  name: '接雨水 II (Trapping Rain Water II)',
  viewId: 'algo-trapping-water-ii-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 题目1：二维木桶效应、外围边界入小根堆、由外向内木板蔓延灌水 (LeetCode 407)',
  icon: '🌊',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握小根堆在二维网格物理模拟中的木桶原理应用及状态转移不变性',
});

export { Visualizer as TrappingWaterIIVisualizer };
