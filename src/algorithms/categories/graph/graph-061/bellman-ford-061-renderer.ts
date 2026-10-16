/**
 * 左程云算法通关课 Class 061: Bellman-Ford 最短路算法 (V-1 轮全边松弛)
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/bellman-ford-renderer
 */

import { bellmanFordVisualizer } from '../bellman-ford-renderer';
import {
  BellmanFordStep,
  buildBellmanFord061Steps,
} from './bellman-ford-061-step-compiler';

export type { BellmanFordStep };
export { buildBellmanFord061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const bellmanFord061Visualizer = bellmanFordVisualizer;
