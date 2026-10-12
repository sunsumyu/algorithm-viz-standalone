/**
 * 大厂高频真题 01: 3D 接雨水 (Trapping Rain Water II)
 * LeetCode 407 / 大厂系统压轴高频题
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  RainCell,
  RainWater3DStep,
  RAIN_WATER_3D_CODES,
  RAIN_WATER_3D_CODE_LINES,
  buildRainWater3DSteps,
} from '../../../../core/renderers/adapters/trapping-rain-water-ii-step-compiler';
import { renderRainWaterCanvas } from '../../../../core/renderers/adapters/trapping-rain-water-ii-canvas-adapter';

export type { RainCell, RainWater3DStep };
export { RAIN_WATER_3D_CODES, RAIN_WATER_3D_CODE_LINES, buildRainWater3DSteps, renderRainWaterCanvas };

export const trappingRainWaterIIVisualizer = registerDeclarativeAlgorithm<RainWater3DStep>({
  id: 'trapping-rain-water-ii',
  name: '3D 接雨水 (Trapping Rain Water II)',
  category: 'search',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 407,
  learningGoal: '掌握小根堆由外向内收缩木桶短板注水算法，秒杀二维网格三维几何积水高频压轴题',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 407)</h3>
      <p>给你一个 <code>m x n</code> 的矩阵，其中的值均为非负整数，代表二维高度图，请计算下雨后该地形一共能接多少立方米的雨水。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例地形：</strong><br/>
        [1, 4, 3, 1, 3, 2]<br/>
        [3, 2, 1, 3, 2, 4]<br/>
        [2, 3, 3, 2, 3, 1]<br/>
        <strong>总积水量：</strong>4
      </div>
    </div>
  `,
  metrics: [
    { id: 'curH', label: '短板高度', color: '#0284c7' },
    { id: 'heapSize', label: '边界堆规模', color: '#8b5cf6' },
    { id: 'focusCoord', label: '聚焦单元格', color: '#059669' },
    { id: 'totalWater', label: '累计接雨水', color: '#15803d' },
  ],
  inputs: [],
  codeLanguages: RAIN_WATER_3D_CODES,
  generateSteps: () => {
    const defaultGrid = [
      [1, 4, 3, 1, 3, 2],
      [3, 2, 1, 3, 2, 4],
      [2, 3, 3, 2, 3, 1],
    ];
    return buildRainWater3DSteps(defaultGrid);
  },
  renderCanvas: (container, step) => {
    renderRainWaterCanvas(container, step);
  },
});
