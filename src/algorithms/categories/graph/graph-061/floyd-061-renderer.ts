/**
 * 左程云算法通关课 Class 061: Floyd-Warshall 全源最短路算法 (O(V³) 动态规划)
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/floyd-renderer
 */

import { floydVisualizer } from '../floyd-renderer';
import {
  FloydStep,
  buildFloyd061Steps,
} from './floyd-061-step-compiler';

export type { FloydStep };
export { buildFloyd061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const floyd061Visualizer = floydVisualizer;
