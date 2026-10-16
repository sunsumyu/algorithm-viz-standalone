/**
 * 左程云算法通关课 Class 061: 朴素 Dijkstra 算法 (Dijkstra Naive · O(V²))
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/dijkstra-basic-renderer
 */

import { dijkstraBasicVisualizer } from '../dijkstra-basic-renderer';
import {
  DijkstraBasicStep,
  buildDijkstraBasic061Steps,
} from './dijkstra-basic-061-step-compiler';

export type { DijkstraBasicStep };
export { buildDijkstraBasic061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const dijkstraBasic061Visualizer = dijkstraBasicVisualizer;
