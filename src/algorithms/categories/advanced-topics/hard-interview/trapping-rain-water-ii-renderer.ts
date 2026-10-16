/**
 * 大厂高频真题 01: 3D 接雨水 (Trapping Rain Water II)
 * LeetCode 407 / 大厂系统压轴高频题
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/graph-062/trapping-rain-water-ii-062-renderer
 */

import { trappingRainWaterII062Visualizer } from '../../graph/graph-062/trapping-rain-water-ii-062-renderer';
import {
  RainCell,
  RainWater3DStep,
  RAIN_WATER_3D_CODES,
  RAIN_WATER_3D_CODE_LINES,
  buildRainWater3DSteps,
} from '../../../../core/renderers/adapters/trapping-rain-water-ii-step-compiler';
import { renderRainWaterCanvas } from '../../../../core/renderers/adapters/trapping-rain-water-ii-canvas-adapter';

export type { RainCell, RainWater3DStep };
export {
  RAIN_WATER_3D_CODES,
  RAIN_WATER_3D_CODE_LINES,
  buildRainWater3DSteps,
  renderRainWaterCanvas,
};

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const trappingRainWaterIIVisualizer = trappingRainWaterII062Visualizer;
