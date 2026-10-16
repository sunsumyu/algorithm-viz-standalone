/**
 * 左程云算法通关课 Class 061: SPFA 算法 (Shortest Path Faster Algorithm · 队列优化的 Bellman-Ford)
 * 领域适配器 (Thin Domain Adapter)
 * 统一收敛至单一事实来源：src/algorithms/categories/graph/spfa-renderer
 */

import { spfaVisualizer } from '../spfa-renderer';
import { SpfaStep, buildSpfa061Steps } from './spfa-061-step-compiler';

export type { SpfaStep };
export { buildSpfa061Steps };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const spfa061Visualizer = spfaVisualizer;
