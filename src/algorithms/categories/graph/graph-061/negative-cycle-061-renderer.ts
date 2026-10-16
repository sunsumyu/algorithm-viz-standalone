/**
 * 左程云算法通关课 Class 061: 负权环判定算法 (洛谷 P3385 · SPFA 计数法)
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/negative-cycle-renderer
 */

import { negativeCycleVisualizer } from '../negative-cycle-renderer';
import {
  NegativeCycleStep,
  buildNegativeCycle061Steps,
} from './negative-cycle-061-step-compiler';

export type { NegativeCycleStep };
export { buildNegativeCycle061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const negativeCycle061Visualizer = negativeCycleVisualizer;
