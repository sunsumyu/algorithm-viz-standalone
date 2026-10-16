/**
 * 左程云算法通关课 Class 061: 堆优化 Dijkstra 算法 (Dijkstra Heap · O(E log V))
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/dijkstra-heap-renderer
 */

import { dijkstraHeapVisualizer } from '../dijkstra-heap-renderer';
import {
  DijkstraHeapStep,
  buildDijkstraHeap061Steps,
} from './dijkstra-heap-061-step-compiler';

export type { DijkstraHeapStep };
export { buildDijkstraHeap061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const dijkstraHeap061Visualizer = dijkstraHeapVisualizer;
